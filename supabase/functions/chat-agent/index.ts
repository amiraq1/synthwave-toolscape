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
        // 3. Parse Request
        // ─────────────────────────────────────────────
        const { query, history = [] } = await req.json();
        if (!query || typeof query !== 'string') {
            throw new Error("No valid query provided");
        }
        console.log("🟢 [Chat Agent] Received query:", query);

        // ─────────────────────────────────────────────
        // 4. Generate Embedding (RAG - Retrieval) - Optional
        // ─────────────────────────────────────────────
        let embedding: number[] | null = null;
        try {
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
                console.warn("⚠️ Embedding API Error (continuing without RAG):", errText);
            } else {
                const embedData = await embedRes.json();
                embedding = embedData.embedding?.values || null;
                if (embedding) {
                    console.log("✅ Embedding generated. Vector length:", embedding.length);
                }
            }
        } catch (embError) {
            console.warn("⚠️ Embedding failed (continuing without RAG):", embError);
        }

        // ─────────────────────────────────────────────
        // 5. Search Database (RAG - Retrieval) - Optional
        // ─────────────────────────────────────────────
        let tools: any[] = [];
        if (embedding && embedding.length > 0) {
            try {
                console.log("🔍 Searching database...");
                const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
                const { data: searchResults, error: searchError } = await supabase.rpc('match_tools', {
                    query_embedding: embedding,
                    match_threshold: 0.5,
                    match_count: 5
                });

                if (searchError) {
                    console.warn("⚠️ DB Search Error (continuing without tools):", searchError.message);
                } else {
                    tools = searchResults || [];
                }
            } catch (dbError) {
                console.warn("⚠️ DB Search failed (continuing without tools):", dbError);
            }
        } else {
            console.log("⏩ Skipping DB search (no embedding available)");
        }
        console.log(`✅ Found ${tools?.length || 0} relevant tools.`);

        // ─────────────────────────────────────────────
        // 6. Build Context (RAG - Augmentation)
        // ─────────────────────────────────────────────
        interface ToolMatch {
            title: string;
            pricing_type: string;
            description: string;
            category?: string;
            slug?: string;
        }

        let contextText = "لم يتم العثور على أدوات محددة في قاعدة البيانات لهذا السؤال.";

        if (tools && tools.length > 0) {
            contextText = tools.map((t: ToolMatch) =>
                `📌 **${t.title}**
   - الوصف: ${t.description}
   - التسعير: ${t.pricing_type}
   - التصنيف: ${t.category || 'عام'}
   - الرابط: /tool/${t.slug || t.title.toLowerCase().replace(/\s+/g, '-')}`
            ).join('\n\n');
        }

        // ─────────────────────────────────────────────
        // 7. Build System Prompt (RAG - Generation)
        // ─────────────────────────────────────────────
        const systemPrompt = `
أنت "مساعد نبض AI" 🤖، خبير ذكاء اصطناعي ودود ومحترف.
مهمتك هي مساعدة المستخدمين في العثور على أفضل أدوات الذكاء الاصطناعي المناسبة لاحتياجاتهم.

═══════════════════════════════════════════════════════
📚 معلومات من قاعدة بيانات "نبض":
═══════════════════════════════════════════════════════
${contextText}
═══════════════════════════════════════════════════════

📋 تعليمات هامة:
1. تحدث باللغة العربية دائماً بنبرة ودية ومفيدة.
2. إذا وجدت أدوات في السياق أعلاه، رشحها للمستخدم واشرح لماذا هي مناسبة لطلبه.
3. استخدم الإيموجي باعتدال لجعل الرد أكثر حيوية.
4. إذا لم تجد أدوات مناسبة، اعتذر بلطف واقترح كلمات بحث بديلة.
5. اجعل إجابتك مختصرة (3-5 جمل) ومركزة على الفائدة.
6. لا تخترع أدوات غير موجودة في السياق.
7. إذا سأل المستخدم سؤالاً عاماً غير متعلق بالأدوات، أجب بإيجاز ثم وجهه للبحث في الموقع.

سؤال المستخدم: ${query}
`;

        // ─────────────────────────────────────────────
        // 8. Generate Response (RAG - Generation)
        // ─────────────────────────────────────────────
        console.log("🤖 Asking Gemini...");

        // Build conversation history for context
        const conversationHistory = history.slice(-4).map((msg: { role: string; content: string }) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const chatRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        ...conversationHistory,
                        {
                            role: 'user',
                            parts: [{ text: systemPrompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 500,
                    },
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    ]
                })
            }
        );

        if (!chatRes.ok) {
            const errText = await chatRes.text();
            console.error("🔴 Chat API Error:", errText);
            throw new Error(`Gemini Chat Failed: ${errText}`);
        }

        const chatData = await chatRes.json();
        const reply = chatData.candidates?.[0]?.content?.parts?.[0]?.text ||
            "عذراً، واجهت مشكلة في التفكير. حاول مرة أخرى! 🔄";

        console.log("✅ Reply generated successfully.");

        // ─────────────────────────────────────────────
        // 9. Return Response
        // ─────────────────────────────────────────────
        return new Response(JSON.stringify({
            reply,
            answer: reply,
            toolsFound: tools?.length || 0,
            rateLimit: {
                remaining: rateLimit.remaining,
                resetIn: Math.ceil(rateLimit.resetIn / 1000)
            }
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
