import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// بسيط rate limiting داخل الذاكرة لكل IP / مستخدم
// ملاحظة: هذا لا يوفر ضمانات قوية على مستوى الكلستر، لكنه يقلل من إساءة الاستخدام الواضحة لكل instance

type RateEntry = {
  count: number;
  windowStart: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000; // دقيقة واحدة
const RATE_LIMIT_MAX_REQUESTS = 20;   // 20 طلب في الدقيقة لكل مُعرّف

const rateLimitStore = new Map<string, RateEntry>();

function getClientIdentifier(req: Request, userId?: string | null): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  return userId ? `${userId}:${ip}` : ip;
}

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const current = rateLimitStore.get(identifier);

  if (!current || now - current.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(identifier, { count: 1, windowStart: now });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  current.count += 1;
  rateLimitStore.set(identifier, current);
  return false;
}

// Allowed origins for CORS
const allowedOrigins = [
  'https://nabd.lovable.app',
  'https://ksdodojvchiybbqxfhcl.supabase.co',
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
];

function getCorsHeaders(origin: string | null) {
  const isAllowed = origin && allowedOrigins.some(allowed => 
    origin === allowed || origin.endsWith('.lovableproject.com')
  );
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // نستخدم IP فقط كبداية قبل معرفة المستخدم
  let clientIdentifier = getClientIdentifier(req, null);

  // فحص مبدئي للتحكم في المعدل لكل IP قبل التحقق من الهوية
  if (isRateLimited(clientIdentifier)) {
    console.warn('Rate limit exceeded (pre-auth) for identifier:', clientIdentifier);
    return new Response(
      JSON.stringify({ error: 'تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided for identifier:', clientIdentifier);
      return new Response(
        JSON.stringify({ error: 'يجب تسجيل الدخول لاستخدام هذه الميزة' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed for identifier:', clientIdentifier, 'error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'فشل التحقق من الهوية، يرجى تسجيل الدخول مجدداً' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // بعد معرفة المستخدم، ندمج الـ userId في مُعرّف التحكم في المعدل
    clientIdentifier = getClientIdentifier(req, user.id);
    if (isRateLimited(clientIdentifier)) {
      console.warn('Rate limit exceeded (post-auth) for user:', user.id, 'identifier:', clientIdentifier);
      return new Response(
        JSON.stringify({ error: 'تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id, 'identifier:', clientIdentifier);

    const { toolName, description } = await req.json();
    
    // Input validation - type checking
    if (!toolName || typeof toolName !== 'string') {
      console.warn('Invalid toolName for user:', user.id, 'identifier:', clientIdentifier);
      return new Response(
        JSON.stringify({ error: 'اسم الأداة مطلوب' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!description || typeof description !== 'string') {
      console.warn('Invalid description for user:', user.id, 'identifier:', clientIdentifier);
      return new Response(
        JSON.stringify({ error: 'الوصف مطلوب' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Input validation - length limits
    const trimmedToolName = toolName.trim();
    const trimmedDescription = description.trim();

    if (trimmedToolName.length < 2 || trimmedToolName.length > 100) {
      console.warn('toolName length out of bounds for user:', user.id, 'identifier:', clientIdentifier);
      return new Response(
        JSON.stringify({ error: 'اسم الأداة يجب أن يكون بين 2-100 حرف' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (trimmedDescription.length < 10 || trimmedDescription.length > 2000) {
      console.warn('description length out of bounds for user:', user.id, 'identifier:', clientIdentifier);
      return new Response(
        JSON.stringify({ error: 'الوصف يجب أن يكون بين 10-2000 حرف' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(
      'Input validation passed - user:',
      user.id,
      'identifier:',
      clientIdentifier,
      'toolName length:',
      trimmedToolName.length,
      'description length:',
      trimmedDescription.length,
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `أنت كاتب محتوى تسويقي محترف متخصص في أدوات الذكاء الاصطناعي.
مهمتك: تحسين وصف الأداة ليكون:
- بأسلوب تسويقي احترافي وجذاب
- موجز ومختصر (لا يتجاوز 3 أسطر أو 50 كلمة)
- باللغة العربية الفصحى السليمة
- يركز على الفائدة الأساسية للمستخدم
- بدون مقدمات أو عبارات مثل "إليك الوصف المحسن"
- أعد الوصف المحسن فقط بدون أي إضافات`;

    const userPrompt = `اسم الأداة: ${trimmedToolName}
الوصف الحالي: ${trimmedDescription}

أعد صياغة هذا الوصف بأسلوب تسويقي احترافي.`;

    console.log('Sending request to Lovable AI Gateway for user:', user.id, 'identifier:', clientIdentifier);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('AI Gateway rate limit for user:', user.id, 'identifier:', clientIdentifier);
        return new Response(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.warn('AI Gateway billing issue for user:', user.id, 'identifier:', clientIdentifier);
        return new Response(
          JSON.stringify({ error: 'يرجى إضافة رصيد لاستخدام هذه الميزة' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error(
        'AI Gateway error for user:',
        user.id,
        'identifier:',
        clientIdentifier,
        'status:',
        response.status,
        'error_length:',
        errorText.length,
      );
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const enhancedDescription = data.choices?.[0]?.message?.content?.trim();

    if (!enhancedDescription) {
      console.error('Empty AI response for user:', user.id, 'identifier:', clientIdentifier);
      throw new Error('No response from AI');
    }

    console.log('Successfully enhanced description for user:', user.id, 'identifier:', clientIdentifier);

    return new Response(
      JSON.stringify({ enhancedDescription }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in enhance-description function for identifier:', clientIdentifier, 'details:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
