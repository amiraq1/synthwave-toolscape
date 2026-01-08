import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: 20 requests per minute per user
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

// In-memory rate limit store (resets on function cold start, but provides immediate protection)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const userLimit = rateLimitStore.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
        // Reset or initialize
        rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
    }

    if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
        return { allowed: false, remaining: 0, resetIn: userLimit.resetTime - now };
    }

    userLimit.count++;
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - userLimit.count, resetIn: userLimit.resetTime - now };
}

serve(async (req: Request) => {
    // 1. Handle CORS pre-flight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Authentication required to prevent abuse and quota exhaustion
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return new Response(
                JSON.stringify({ error: 'يجب تسجيل الدخول لاستخدام نبض AI' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

        if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing in Secrets!");

        // Verify user authentication
        const authSupabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
            global: { headers: { Authorization: authHeader } }
        });

        const token = authHeader.replace('Bearer ', '');
        const { data: claimsData, error: claimsError } = await authSupabase.auth.getClaims(token);
        
        if (claimsError || !claimsData?.claims) {
            console.error("🔴 Auth error:", claimsError?.message);
            return new Response(
                JSON.stringify({ error: 'جلسة غير صالحة، يرجى تسجيل الدخول مجدداً' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const userId = claimsData.claims.sub as string;
        console.log("✅ Authenticated user:", userId);

        // Rate limiting check
        const rateLimit = checkRateLimit(userId);
        if (!rateLimit.allowed) {
            console.warn(`⚠️ Rate limit exceeded for user: ${userId}`);
            return new Response(
                JSON.stringify({ 
                    error: 'لقد تجاوزت الحد المسموح من الطلبات. يرجى الانتظار قليلاً.',
                    retryAfter: Math.ceil(rateLimit.resetIn / 1000)
                }),
                { 
                    status: 429, 
                    headers: { 
                        ...corsHeaders, 
                        'Content-Type': 'application/json',
                        'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000))
                    } 
                }
            );
        }
        console.log(`📊 Rate limit: ${rateLimit.remaining} requests remaining`);

        const { query } = await req.json();
        console.log("🟢 [Chat] Received query:", query);

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
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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
