import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 1. حاجز الأمان الأول: التعامل مع طلبات CORS (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;

    // 2. حاجز الأمان الثاني: قراءة البيانات بأمان
    let query, agentSlug;
    try {
      const body = await req.json();
      console.log("Received body:", body); // Log for debugging

      // Support both possible structures: { query, agentSlug } or { message, agentSlug }
      query = body.query || body.message;
      agentSlug = body.agentSlug || 'general';

    } catch (e) {
      throw new Error("خطأ: لم يتم إرسال أي بيانات (Body is empty)");
    }

    if (!query) throw new Error("نص السؤال مفقود (Query is missing)");

    // 3. بدء العمل
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // جلب شخصية الوكيل
    console.log(`Fetching agent: ${agentSlug}`);
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('system_prompt')
      .eq('slug', agentSlug)
      .single();

    if (agentError) {
      console.error("Error fetching agent:", agentError);
      // Fallback if agent not found
    }

    const systemInstructions = agentData?.system_prompt || "أنت مساعد ذكي ومفيد.";

    // توليد الـ Embedding (استخدام v1 المستقر)
    console.log("Generating embedding...");
    const embeddingResp = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
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
      const err = await embeddingResp.text();
      console.error("Gemini Embedding Error:", err);
      throw new Error("فشل الاتصال بـ Gemini Embedding");
    }

    const embeddingData = await embeddingResp.json();
    const embedding = embeddingData.embedding?.values;

    // البحث في قاعدة البيانات (RAG)
    console.log("Searching tools...");
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
      contextText = tools.map((t: any) =>
        `- ${t.title}: ${t.description} (${t.pricing_type})`
      ).join('\n');
    }

    // بناء التعليمات النهائية
    const finalPrompt = `
      ${systemInstructions}
      
      استخدم البيانات التالية للإجابة على سؤال المستخدم بدقة:
      ---
      ${contextText}
      ---
      
      سؤال المستخدم: ${query}
    `;

    // التوليد النهائي (استخدام v1 المستقر)
    console.log("Generating final response...");
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
      const err = await chatResp.text();
      console.error("Gemini Chat Error:", err);
      throw new Error("فشل الاتصال بـ Gemini Chat");
    }

    const chatData = await chatResp.json();
    const reply = chatData.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أستطع تكوين إجابة.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, // نرسل 400 بدلاً من 500 ليفهم المتصفح أنه خطأ منطقي
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
