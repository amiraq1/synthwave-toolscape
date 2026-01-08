import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// إعدادات CORS للسماح بالطلبات من المتصفح
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
        // 2. التحقق من المدخلات (Input Validation)
        // لا نثق أبداً بما يرسله العميل، نتأكد أولاً
        const { query, match_threshold = 0.7, match_count = 10 } = await req.json();

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            throw new Error("ERR_INVALID_QUERY: نص البحث مطلوب ولا يمكن أن يكون فارغاً.");
        }

        if (match_threshold < 0 || match_threshold > 1) {
            throw new Error("ERR_INVALID_THRESHOLD: دقة التطابق يجب أن تكون بين 0 و 1.");
        }

        // جلب المفاتيح
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

        if (!GEMINI_API_KEY) {
            console.error("Missing GEMINI_API_KEY");
            throw new Error("ERR_SERVER_CONFIG: خطأ في إعدادات السيرفر الداخلي.");
        }

        // 3. توليد الـ Embedding (باستخدام Gemini)
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
            const errData = await embeddingResp.json();
            console.error("Gemini API Error:", errData);
            throw new Error("ERR_AI_SERVICE: فشل الاتصال بخدمة الذكاء الاصطناعي.");
        }

        const embeddingData = await embeddingResp.json();
        const embedding = embeddingData.embedding?.values;

        if (!embedding) {
            throw new Error("ERR_EMBEDDING_FAILED: لم يتم توليد المتجهات بنجاح.");
        }

        // 4. البحث في قاعدة البيانات (RPC Call)
        const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

        const { data: tools, error: dbError } = await supabase.rpc('match_tools', {
            query_embedding: embedding,
            match_threshold: match_threshold, // دقة البحث
            match_count: match_count,         // عدد النتائج
        });

        if (dbError) {
            console.error("Database Error:", dbError);
            throw new Error("ERR_DATABASE: حدث خطأ أثناء البحث في قاعدة البيانات.");
        }

        // 5. الرد بنجاح
        return new Response(JSON.stringify(tools), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        // 6. معالجة الأخطاء المركزية (Centralized Error Handling)
        console.error("Function Error:", error.message);

        // تحديد نوع الخطأ للعميل (هل هو خطأ منه أم من السيرفر؟)
        const isClientError = error.message.startsWith("ERR_INVALID");
        const status = isClientError ? 400 : 500;

        return new Response(
            JSON.stringify({
                error: true,
                code: error.message.split(':')[0] || "ERR_UNKNOWN",
                message: isClientError ? error.message.split(':')[1] : "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً."
            }),
            {
                status: status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    }
});
