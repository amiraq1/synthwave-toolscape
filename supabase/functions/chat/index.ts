import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // التعامل مع طلبات OPTIONS (CORS)
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { query } = await req.json();
        if (!query) throw new Error("No query provided");

        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
        const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!;

        // 1. إنشاء العميل
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // 2. تحويل سؤال المستخدم إلى متجه (Embedding) لفهم المعنى
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
        const embeddingData = await embeddingResp.json();
        const embedding = embeddingData.embedding?.values;

        // 3. البحث في قاعدة البيانات عن أدوات ذات صلة (Retrieval - RAG)
        const { data: tools } = await supabase.rpc('match_tools', {
            query_embedding: embedding,
            match_threshold: 0.7, // دقة المطابقة
            match_count: 4,      // عدد الأدوات التي نريد استخدامها كمراجع
        });

        // 4. بناء "التعليمات" (System Prompt) للذكاء الاصطناعي
        let contextText = "لم يتم العثور على أدوات محددة في قاعدة البيانات لهذا السؤال.";
        if (tools && tools.length > 0) {
            contextText = tools.map((t: any) =>
                `- اسم الأداة: ${t.title}\n  الوصف: ${t.description}\n  السعر: ${t.pricing_type}`
            ).join('\n\n');
        }

        const systemPrompt = `
      أنت "مساعد نبض AI"، وكيل ذكي ودود ومحترف.
      مهمتك هي مساعدة المستخدمين في العثور على الأدوات المناسبة وتنفيذ المهام بناءً على البيانات المتوفرة لديك.
      
      استخدم المعلومات التالية من قاعدة بياناتنا للإجابة على سؤال المستخدم:
      ---
      ${contextText}
      ---
      
      تعليمات هامة:
      1. تحدث باللغة العربية دائماً وبنبرة مفيدة.
      2. إذا وجدت أدوات في السياق أعلاه، رشحها للمستخدم واشرح لماذا هي مناسبة.
      3. إذا لم تجد أدوات في السياق، اعتذر بلطف وقدم نصيحة عامة، ولكن أخبره أنك لم تجد شيئاً في قاعدة البيانات.
      4. اجعل إجابتك مختصرة ومركزة (أنت وكيل تنفيذي ولست كاتب مقالات).
    `;

        // 5. إرسال كل شيء لـ Gemini لتوليد الإجابة النهائية (Generation)
        const chatResp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: systemPrompt }, // التعليمات + السياق
                            { text: `سؤال المستخدم: ${query}` } // السؤال الحالي
                        ]
                    }]
                })
            }
        );

        const chatData = await chatResp.json();
        const reply = chatData.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، واجهت مشكلة في التفكير.";

        // 6. إرجاع الإجابة للواجهة
        return new Response(JSON.stringify({ reply }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
