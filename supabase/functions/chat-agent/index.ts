import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface MatchedTool {
  title: string;
  description: string;
  pricing_type: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;

    if (!GEMINI_API_KEY) {
      throw new Error("مفتاح GEMINI_API_KEY غير موجود في إعدادات السيرفر");
    }

    // قراءة البيانات بأمان
    let query, agentSlug;
    try {
      const body = await req.json();
      // Support both styles for flexibility
      query = body.query || body.message;
      agentSlug = body.agentSlug || 'general';
    } catch (e) {
      throw new Error("لم يتم إرسال أي بيانات (Body is empty)");
    }

    if (!query) throw new Error("نص السؤال مفقود");

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1. جلب شخصية الوكيل
    const { data: agentData } = await supabase
      .from('agents')
      .select('system_prompt')
      .eq('slug', agentSlug)
      .single();

    const systemInstructions = agentData?.system_prompt || "أنت مساعد ذكي ومفيد.";

    // 2. توليد Embedding (نستخدم v1beta لهذا النموذج لأنه أكثر استقراراً عليه)
    // 👇 التغيير هنا: v1beta
    const embeddingResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text: query }] }
        })
      }
    );

    if (!embeddingResp.ok) {
      const errText = await embeddingResp.text();
      console.error("Gemini Embedding Error:", errText); // سيظهر هذا في اللوج
      // محاولة استخدام نموذج أقدم كاحتياطي إذا فشل الحديث
      throw new Error(`فشل خدمة Embedding: ${errText}`);
    }

    const embeddingData = await embeddingResp.json();
    const embedding = embeddingData.embedding?.values;

    // 3. البحث في قاعدة البيانات (RAG)
    const { data: tools, error: rpcError } = await supabase.rpc('match_tools', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 4,
    });

    if (rpcError) {
      console.error("RPC Error:", rpcError);
    }

    let contextText = "لم يتم العثور على أدوات محددة.";
    if (tools && tools.length > 0) {
      contextText = (tools as MatchedTool[]).map((t) =>
        `- ${t.title}: ${t.description} (${t.pricing_type})`
      ).join('\n');
    }

    const finalPrompt = `
      ${systemInstructions}
      
      استخدم البيانات التالية للإجابة على سؤال المستخدم:
      ---
      ${contextText}
      ---
      
      سؤال المستخدم: ${query}
    `;

    // 4. التوليد النهائي (نستخدم v1 لهذا النموذج)
    // 👇 التغيير هنا: v1
    const chatResp = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: finalPrompt }]
          }]
        })
      }
    );

    if (!chatResp.ok) {
      const errText = await chatResp.text();
      console.error("Gemini Chat Error:", errText);
      throw new Error(`فشل خدمة Chat: ${errText}`);
    }

    const chatData = await chatResp.json();
    const reply = chatData.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أستطع تكوين إجابة.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Function Fatal Error:", errorMessage);
    return new Response(JSON.stringify({
      reply: "عذراً، واجهت مشكلة تقنية في الاتصال بالخدمات الذكية. الرجاء المحاولة لاحقاً."
    }), {
      status: 200, // نرسل 200 مع رسالة خطأ لطيفة للمستخدم بدلاً من تعطل الواجهة
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
