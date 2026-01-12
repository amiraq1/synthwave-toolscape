import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // 1. التعامل مع طلبات OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // التحقق من المدخلات (Input Validation)
        const { query, match_threshold = 0.7, match_count = 10 } = await req.json();

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            throw new Error("ERR_INVALID_QUERY: نص البحث مطلوب.");
        }

        // تنظيف النص (إزالة المسافات الزائدة وتحويله لأحرف صغيرة لزيادة فرصة المطابقة في الكاش)
        const cleanQuery = query.trim().toLowerCase();

        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

        const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

        // ---------------------------------------------------------
        // 2. فحص الكاش (Caching Layer) 🚀
        // ---------------------------------------------------------
        let embedding: number[] | null = null;

        const { data: cachedData } = await supabase
            .from('query_cache')
            .select('embedding')
            .eq('query_text', cleanQuery)
            .maybeSingle(); // Changed single() to maybeSingle() to handle no results gracefully

        if (cachedData) {
            console.log(`🔥 Cache HIT for query: "${cleanQuery}"`);
            // إذا كان stored as string في بعض الحالات، parse it. في vector type غالبًا يعود كـ string or array
            embedding = typeof cachedData.embedding === 'string' ? JSON.parse(cachedData.embedding) : cachedData.embedding;
        } else {
            console.log(`❄️ Cache MISS for query: "${cleanQuery}" - Calling Gemini`);

            // 3. طلب Gemini (إذا لم نجد كاش)
            if (!GEMINI_API_KEY) {
                throw new Error("ERR_SERVER_CONFIG: مفتاح Gemini مفقود.");
            }

            const embeddingResp = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: "models/text-embedding-004",
                        content: { parts: [{ text: cleanQuery }] } // نرسل النص المنظف
                    })
                }
            );

            if (!embeddingResp.ok) {
                const errData = await embeddingResp.json();
                console.error("Gemini API Error:", errData);
                throw new Error("ERR_AI_SERVICE: فشل الاتصال بخدمة الذكاء الاصطناعي.");
            }

            const embeddingData = await embeddingResp.json();
            embedding = embeddingData.embedding?.values;

            if (!embedding) {
                throw new Error("ERR_EMBEDDING_FAILED: لم يتم توليد المتجهات بنجاح.");
            }

            // 4. حفظ في الكاش للمستقبل
            const { error: insertError } = await supabase.from('query_cache').insert({
                query_text: cleanQuery,
                embedding: embedding
            });

            if (insertError) {
                console.error("Cache Insert Error (Non-blocking):", insertError);
            }
        }

        // ---------------------------------------------------------
        // 5. البحث في قاعدة البيانات (RPC Call)
        // ---------------------------------------------------------
        const { data: tools, error: dbError } = await supabase.rpc('match_tools', {
            query_embedding: embedding,
            match_threshold: match_threshold,
            match_count: match_count,
        });

        if (dbError) {
            console.error("Database RPC Error:", dbError);
            throw new Error("ERR_DATABASE: حدث خطأ أثناء البحث في قاعدة البيانات.");
        }

        // 6. الرد بنجاح
        return new Response(JSON.stringify(tools), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'ERR_UNKNOWN';
        console.error("Function Error:", errorMessage);
        const isClientError = errorMessage.startsWith("ERR_INVALID");

        return new Response(
            JSON.stringify({
                error: true,
                code: errorMessage.split(':')[0] || "ERR_UNKNOWN",
                message: isClientError ? errorMessage.split(':')[1] || errorMessage : "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً."
            }),
            {
                status: isClientError ? 400 : 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
