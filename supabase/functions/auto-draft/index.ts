import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// --- تعريف أنواع البيانات (Types) ---
interface RequestBody {
  name: string;
  url: string;
  description_en?: string;
}

interface AIResponse {
  title: string;
  description: string;
  category: string;
  pricing_type: string;
  features: string[];
}

// --- الإعدادات ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// نستخدم نموذج flash 1.5 للسرعة والتوفير
const GEMINI_MODEL = 'gemini-1.5-flash';

Deno.serve(async (req: Request) => {
  // 1. معالجة طلبات CORS (ضروري للمتصفح)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // جلب المتغيرات البيئية
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!; // مفتاح الخدمة لتجاوز الصلاحيات عند الكتابة

    // 2. التحقق من التوثيق (Authentication)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Authentication required');

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) throw new Error('Invalid authentication');

    // 3. التحقق من صلاحية الأدمن (Authorization)
    // نستخدم دالة RPC للتأكد من أن المستخدم مسؤول
    const { data: isAdmin, error: roleError } = await supabaseAuth.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 4. التحقق من المدخلات
    const { name, url, description_en }: RequestBody = await req.json();
    if (!name || !url) throw new Error("Missing required fields: name, url");

    // 5. استدعاء Gemini API
    const prompt = `
      You are an expert content editor for 'Nabd AI'. Convert the provided tool info into a structured JSON for an Arabic directory.
      
      Tool: ${name}
      URL: ${url}
      Description: ${description_en || 'N/A'}

      Output EXACTLY in this JSON structure:
      {
        "title": "Arabic title or Brand Name (NO EMOJIS)",
        "description": "Professional Arabic description (2 sentences, NO EMOJIS)",
        "category": "One of: ['نصوص', 'صور', 'برمجة', 'فيديو', 'إنتاجية', 'صوت', 'دراسة وطلاب']",
        "pricing_type": "One of: ['مجاني', 'مدفوع', 'تجربة مجانية']",
        "features": ["Feature 1 (Arabic)", "Feature 2 (Arabic)", "Feature 3 (Arabic)"]
      }
    `;

    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json" // إجبار الموديل على إخراج JSON فقط
          }
        })
      }
    );

    if (!aiResponse.ok) {
      const err = await aiResponse.text();
      console.error("Gemini API Error:", err);
      throw new Error(`Gemini API Error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) throw new Error("Empty response from AI");

    // تحويل النص إلى كائن JSON (آمن الآن بسبب responseMimeType)
    let toolData: AIResponse;
    try {
      toolData = JSON.parse(rawContent);
    } catch {
      console.error("JSON Parse Error. Raw text was:", rawContent);
      throw new Error("Failed to parse AI response");
    }

    // 6. الإضافة لقاعدة البيانات (استخدام Service Role لتجاوز RLS)
    // نستخدم Service Role لأننا نضيف بيانات كأدمن وقد تكون قواعد RLS مقيدة
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data, error: insertError } = await supabaseAdmin
      .from('tools')
      .insert({
        title: toolData.title,
        description: toolData.description,
        title_en: name,
        description_en: description_en,
        url: url,
        category: toolData.category,
        pricing_type: toolData.pricing_type,
        features: toolData.features,
        is_published: false, // وضع المسودة
        is_featured: false,
        // created_by: user.id // قم بإلغاء التعليق إذا كان الجدول يدعم هذا الحقل
      })
      .select()
      .single();

    if (insertError) {
      console.error("DB Insert Error:", insertError);
      throw insertError;
    }

    return new Response(JSON.stringify({
      success: true,
      tool: data,
      message: "تم إنشاء مسودة الأداة بنجاح"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Function Error:", errorMessage);

    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
