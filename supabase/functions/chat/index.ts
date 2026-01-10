import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiting: 20 requests per minute per user
// ─────────────────────────────────────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const userLimit = rateLimitStore.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
        rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
        return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
    }

    if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
        return { allowed: false, remaining: 0, resetIn: userLimit.resetTime - now };
    }

    userLimit.count++;
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - userLimit.count, resetIn: userLimit.resetTime - now };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────────────────────────────────────────
serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // ─────────────────────────────────────────────
        // 1. Authentication Check
        // ─────────────────────────────────────────────
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

        if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing!");

        // ─────────────────────────────────────────────
        // 2. Verify User & Rate Limit
        // ─────────────────────────────────────────────
        const authSupabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
            global: { headers: { Authorization: authHeader } }
        });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await authSupabase.auth.getUser(token);

        if (authError || !user) {
            console.error("🔴 Auth error:", authError?.message);
            return new Response(
                JSON.stringify({ error: 'جلسة غير صالحة، يرجى تسجيل الدخول مجدداً' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const userId = user.id;
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

        // ─────────────────────────────────────────────
        // 3. Parse Request & Identify Agent
        // ─────────────────────────────────────────────
        const { query, history = [], agentSlug = 'general' } = await req.json();

        // تعريف شخصيات الوكلاء (مدمجة هنا للسرعة والموثوقية بدلاً من قاعدة البيانات)
        const AGENT_PERSONAS: Record<string, string> = {
            'general': 'أنت مساعد ذكي شامل. ساعد المستخدم في أي طلب.',
            'coder': 'أنت خبير برمجة ومطور محترف. ركز على الأدوات البرمجية والأكواد.',
            'designer': 'أنت مصمم جرافيك وفنان رقمي. ركز على أدوات الصور والتصميم.',
            'writer': 'أنت كاتب محتوى ومحرر مبدع. ركز على أدوات الكتابة والتحسين اللغوي.',
            'video': 'أنت خبير مونتاج وفيديو. ركز على أدوات إنشاء وتحرير الفيديو.'
        };

        const currentPersona = AGENT_PERSONAS[agentSlug] || AGENT_PERSONAS['general'];
        console.log(`👤 Agent Persona: ${agentSlug}`);

        // ─────────────────────────────────────────────
        // 4. Generate Embedding (Simple & Robust)
        // ─────────────────────────────────────────────
        let contextText = "";
        let toolsFound = 0;

        try {
            if (GEMINI_API_KEY) {
                // توليد Embedding
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

                if (embedRes.ok) {
                    const embedData = await embedRes.json();
                    const embedding = embedData.embedding?.values;

                    if (embedding) {
                        // بحث في قاعدة البيانات
                        const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
                        const { data: searchResults } = await supabase.rpc('match_tools', {
                            query_embedding: embedding,
                            match_threshold: 0.5,
                            match_count: 5
                        });

                        if (searchResults && searchResults.length > 0) {
                            toolsFound = searchResults.length;
                            contextText = "🛠️ **أدوات مقترحة من قاعدة البيانات:**\n" + searchResults.map((t: any) =>
                                `🔹 **[${t.title}](/tool/${t.slug || '#'})**\n   - ${t.description.substring(0, 100)}...`
                            ).join('\n\n');
                        }
                    }
                }
            }
        } catch (e) {
            console.warn("Embedding/Search skipped:", e);
        }

        // ─────────────────────────────────────────────
        // 5. Generate Response (Gemini 1.5 Flash)
        // ─────────────────────────────────────────────
        const systemPrompt = `
${currentPersona}

مهمتك هي مساعدة المستخدم بالعربية.
${contextText ? `\nاستخدم المعلومات التالية عن الأدوات المتوفرة في إجابتك:\n${contextText}` : ''}

تعليمات:
1. كن مفيداً ومختصراً.
2. إذا وجدت أدوات مقترحة أعلاه، رشحها للمستخدم.
3. تحدث كنماذج ذكاء اصطناعي ودود.
`;

        const chatRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        ...history.slice(-4).map((msg: any) => ({
                            role: msg.role === 'user' ? 'user' : 'model',
                            parts: [{ text: msg.content }]
                        })),
                        { role: 'user', parts: [{ text: query }] }
                    ],
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    generationConfig: { maxOutputTokens: 800 }
                })
            }
        );

        if (!chatRes.ok) {
            throw new Error(`Gemini API Error: ${chatRes.statusText}`);
        }

        const chatData = await chatRes.json();
        const reply = chatData.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أستطع توليد رد.";

        return new Response(JSON.stringify({
            reply,
            answer: reply,
            toolsFound,
            rateLimit: { remaining: rateLimit.remaining, resetIn: Math.ceil(rateLimit.resetIn / 1000) }
        }), {
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
