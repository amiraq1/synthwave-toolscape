import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // 1. Handle CORS pre-flight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { query } = await req.json();
        console.log("🟢 [Chat] Received query:", query);

        // Public function: no authentication required.
        // Calls from the web are allowed; if you want to restrict access later,
        // re-enable an internal key check or require JWT-based Authorization.

        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

        if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing in Secrets!");

        // 2. Generate Embedding
        console.log("🔄 Generating embedding...");
        const embedRes = await fetch(
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

        if (!embedRes.ok) {
            const errText = await embedRes.text();
            console.error("🔴 Embedding API Error:", errText);
            throw new Error(`Gemini Embedding Failed: ${errText}`);
        }

        const embedData = await embedRes.json();
        const embedding = embedData.embedding.values;
        console.log("✅ Embedding generated. Vector length:", embedding.length);

        // 3. Search Database
        console.log("🔍 Searching database...");
        const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
        const { data: tools, error: searchError } = await supabase.rpc('match_tools', {
            query_embedding: embedding,
            match_threshold: 0.3,
            match_count: 5
        });

        if (searchError) {
            console.error("🔴 DB Search Error:", searchError);
            throw new Error(`Database Search Failed: ${searchError.message}`);
        }
        console.log(`✅ Found ${tools?.length || 0} relevant tools.`);

        // 4. Generate Answer with Gemini
        interface ToolMatch { title: string; pricing_type: string; description: string; }
        const context = tools?.map((t: ToolMatch) =>
            `- ${t.title} (${t.pricing_type}): ${t.description}`
        ).join('\n') || "لا توجد أدوات مطابقة تماماً.";

        const systemPrompt = `
      أنت المساعد الذكي لموقع "نبض AI" المتخصص في أدوات الذكاء الاصطناعي.
      
      السياق (أدوات وجدناها في قاعدة البيانات):
      ${context}

      سؤال المستخدم: ${query}

      المطلوب:
      1. أجب بالعربية بلهجة ودودة ومحترفة.
      2. رشح الأدوات المناسبة من السياق أعلاه.
      3. إذا لم تجد أدوات مناسبة في السياق، قدم نصيحة عامة ولكن أخبر المستخدم أنك تبحث في قاعدة البيانات فقط.
      4. كن مختصراً ومفيداً.
    `;

        console.log("🤖 Asking Gemini...");
        const chatRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: systemPrompt }] }]
                })
            }
        );

        if (!chatRes.ok) {
            const errText = await chatRes.text();
            console.error("🔴 Chat API Error:", errText);
            throw new Error(`Gemini Chat Failed: ${errText}`);
        }

        const chatData = await chatRes.json();
        const reply = chatData.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، حدث خطأ في التوليد.";
        console.log("✅ Reply generated successfully.");

        // Return both `answer` and legacy `reply` keys to keep clients working.
        return new Response(JSON.stringify({ answer: reply, reply }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error("🔥 FATAL ERROR:", errMessage);
        return new Response(JSON.stringify({ error: errMessage }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
