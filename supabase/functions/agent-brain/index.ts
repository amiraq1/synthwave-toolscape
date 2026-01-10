/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 Agent Brain - عقل الوكيل
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * وكيل ذكاء اصطناعي متقدم مع قدرات تنفيذية (Agentic AI with Tool Calling)
 * يستخدم Gemini Function Calling لتنفيذ مهام حقيقية على قاعدة البيانات
 * 
 * الأدوات المتاحة:
 * - search_tools: البحث الدلالي في الأدوات
 * - compare_tools: مقارنة أداتين أو أكثر
 * - get_tool_details: جلب تفاصيل أداة محددة
 * - search_by_category: البحث حسب الفئة
 * - get_popular_tools: جلب الأدوات الأكثر شعبية
 * 
 * @author Nabd AI Team
 * @version 2.0.0
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─────────────────────────────────────────────────────────────────────────────
// CORS Headers
// ─────────────────────────────────────────────────────────────────────────────
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────
interface Tool {
    id: string;
    title: string;
    description: string;
    pricing_type: string;
    category: string;
    slug: string;
    image_url?: string;
    website_url?: string;
    features?: string[];
    rating?: number;
    reviews_count?: number;
}

interface FunctionCall {
    name: string;
    args: Record<string, unknown>;
}

interface ExecutionResult {
    success: boolean;
    data?: unknown;
    error?: string;
}

// نوع الوكيل من قاعدة البيانات
interface Agent {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    avatar_emoji: string;
    system_prompt: string;
    tools_enabled: string[];
    temperature: number;
    is_active: boolean;
}

// الوكيل الافتراضي (في حال عدم وجود وكيل في DB)
const DEFAULT_AGENT: Agent = {
    id: 'default',
    name: 'المساعد العام',
    slug: 'general',
    description: 'مساعدك الذكي للعثور على أفضل أدوات الذكاء الاصطناعي',
    avatar_emoji: '🤖',
    system_prompt: `أنت "مساعد نبض AI"، وكيل ذكي ودود ومحترف.
مهمتك مساعدة المستخدمين في العثور على أي أداة ذكاء اصطناعي تناسب احتياجاتهم.

تعليمات:
1. تحدث بالعربية دائماً بنبرة ودية ومفيدة
2. استخدم الأدوات المتاحة لك للبحث عن الأدوات المناسبة
3. قدم إجابات مختصرة ومركزة (3-5 نقاط)
4. استخدم الإيموجي باعتدال لجعل الرد أكثر حيوية
5. اذكر روابط الأدوات بصيغة: /tool/[slug]`,
    tools_enabled: ['search_tools', 'compare_tools', 'get_tool_details', 'search_by_category', 'get_popular_tools'],
    temperature: 0.7,
    is_active: true
};

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limiting: 30 requests per minute per user
// ─────────────────────────────────────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;
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
// Tool Definitions for Gemini Function Calling
// ─────────────────────────────────────────────────────────────────────────────
const TOOL_DEFINITIONS = [
    {
        name: "search_tools",
        description: "البحث الدلالي عن أدوات الذكاء الاصطناعي بناءً على وصف أو حاجة المستخدم. استخدم هذه الأداة عندما يسأل المستخدم عن أدوات لمهمة معينة.",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "استعلام البحث (مثال: 'أداة لتحرير الصور بالذكاء الاصطناعي')"
                },
                limit: {
                    type: "number",
                    description: "عدد النتائج المطلوبة (الافتراضي: 5)"
                }
            },
            required: ["query"]
        }
    },
    {
        name: "compare_tools",
        description: "مقارنة أداتين أو أكثر من حيث الميزات والأسعار. استخدم هذه الأداة عندما يطلب المستخدم مقارنة بين أدوات محددة.",
        parameters: {
            type: "object",
            properties: {
                tool_names: {
                    type: "array",
                    items: { type: "string" },
                    description: "أسماء الأدوات المراد مقارنتها"
                }
            },
            required: ["tool_names"]
        }
    },
    {
        name: "get_tool_details",
        description: "جلب التفاصيل الكاملة لأداة محددة بالاسم أو المعرف. استخدم هذه الأداة عندما يسأل المستخدم عن أداة بعينها.",
        parameters: {
            type: "object",
            properties: {
                tool_name: {
                    type: "string",
                    description: "اسم الأداة المطلوبة"
                }
            },
            required: ["tool_name"]
        }
    },
    {
        name: "search_by_category",
        description: "البحث عن أدوات في فئة محددة. استخدم هذه الأداة عندما يريد المستخدم رؤية أدوات في تصنيف معين.",
        parameters: {
            type: "object",
            properties: {
                category: {
                    type: "string",
                    description: "اسم الفئة (مثال: 'كتابة المحتوى', 'تحرير الصور', 'تحليل البيانات')"
                },
                limit: {
                    type: "number",
                    description: "عدد النتائج المطلوبة (الافتراضي: 5)"
                }
            },
            required: ["category"]
        }
    },
    {
        name: "get_popular_tools",
        description: "جلب الأدوات الأكثر شعبية أو الأعلى تقييماً. استخدم هذه الأداة عندما يسأل المستخدم عن أفضل الأدوات أو الأكثر استخداماً.",
        parameters: {
            type: "object",
            properties: {
                limit: {
                    type: "number",
                    description: "عدد النتائج المطلوبة (الافتراضي: 5)"
                },
                category: {
                    type: "string",
                    description: "فلترة حسب الفئة (اختياري)"
                }
            },
            required: []
        }
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// Tool Execution Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * البحث الدلالي عن الأدوات باستخدام embeddings
 */
async function executeSearchTools(
    supabase: SupabaseClient,
    geminiApiKey: string,
    args: { query: string; limit?: number }
): Promise<ExecutionResult> {
    try {
        const { query, limit = 5 } = args;

        // 1. توليد embedding للاستعلام
        const embedRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${geminiApiKey}`,
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
            throw new Error("Failed to generate embedding");
        }

        const embedData = await embedRes.json();
        const embedding = embedData.embedding?.values;

        if (!embedding) {
            // Fallback: بحث نصي بسيط
            const { data, error } = await supabase
                .from('tools')
                .select('id, title, description, pricing_type, category, slug, image_url')
                .ilike('title', `%${query}%`)
                .limit(limit);

            if (error) throw error;
            return { success: true, data };
        }

        // 2. البحث الدلالي
        const { data, error } = await supabase.rpc('match_tools', {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: limit
        });

        if (error) throw error;
        return { success: true, data };

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * مقارنة أدوات متعددة
 */
async function executeCompareTools(
    supabase: SupabaseClient,
    args: { tool_names: string[] }
): Promise<ExecutionResult> {
    try {
        const { tool_names } = args;

        if (tool_names.length < 2) {
            return { success: false, error: "يجب تحديد أداتين على الأقل للمقارنة" };
        }

        // البحث عن كل أداة
        const toolsPromises = tool_names.map(name =>
            supabase
                .from('tools')
                .select('id, title, description, pricing_type, category, slug, image_url, website_url, features')
                .ilike('title', `%${name}%`)
                .limit(1)
                .single()
        );

        const results = await Promise.all(toolsPromises);
        const tools = results
            .filter(r => !r.error && r.data)
            .map(r => r.data);

        if (tools.length < 2) {
            return { success: false, error: "لم يتم العثور على أدوات كافية للمقارنة" };
        }

        return { success: true, data: { tools, comparison_count: tools.length } };

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * جلب تفاصيل أداة محددة
 */
async function executeGetToolDetails(
    supabase: SupabaseClient,
    args: { tool_name: string }
): Promise<ExecutionResult> {
    try {
        const { tool_name } = args;

        const { data, error } = await supabase
            .from('tools')
            .select('*')
            .ilike('title', `%${tool_name}%`)
            .limit(1)
            .single();

        if (error || !data) {
            return { success: false, error: `لم يتم العثور على أداة باسم "${tool_name}"` };
        }

        return { success: true, data };

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * البحث حسب الفئة
 */
async function executeSearchByCategory(
    supabase: SupabaseClient,
    args: { category: string; limit?: number }
): Promise<ExecutionResult> {
    try {
        const { category, limit = 5 } = args;

        const { data, error } = await supabase
            .from('tools')
            .select('id, title, description, pricing_type, category, slug, image_url')
            .ilike('category', `%${category}%`)
            .limit(limit);

        if (error) throw error;

        if (!data || data.length === 0) {
            return { success: false, error: `لم يتم العثور على أدوات في فئة "${category}"` };
        }

        return { success: true, data };

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * جلب الأدوات الشائعة
 */
async function executeGetPopularTools(
    supabase: SupabaseClient,
    args: { limit?: number; category?: string }
): Promise<ExecutionResult> {
    try {
        const { limit = 5, category } = args;

        let query = supabase
            .from('tools')
            .select('id, title, description, pricing_type, category, slug, image_url')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (category) {
            query = query.ilike('category', `%${category}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        return { success: true, data };

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * منسق تنفيذ الأدوات
 */
async function executeTool(
    functionCall: FunctionCall,
    supabase: SupabaseClient,
    geminiApiKey: string
): Promise<ExecutionResult> {
    console.log(`🔧 Executing tool: ${functionCall.name}`, functionCall.args);

    switch (functionCall.name) {
        case "search_tools":
            return executeSearchTools(supabase, geminiApiKey, functionCall.args as { query: string; limit?: number });

        case "compare_tools":
            return executeCompareTools(supabase, functionCall.args as { tool_names: string[] });

        case "get_tool_details":
            return executeGetToolDetails(supabase, functionCall.args as { tool_name: string });

        case "search_by_category":
            return executeSearchByCategory(supabase, functionCall.args as { category: string; limit?: number });

        case "get_popular_tools":
            return executeGetPopularTools(supabase, functionCall.args as { limit?: number; category?: string });

        default:
            return { success: false, error: `Unknown tool: ${functionCall.name}` };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────────────────────────────────────────
serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const startTime = performance.now();

    try {
        // ─────────────────────────────────────────────
        // 1. Authentication Check
        // ─────────────────────────────────────────────
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return new Response(
                JSON.stringify({ error: 'يجب تسجيل الدخول لاستخدام نبض AI 🔐' }),
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
                JSON.stringify({ error: 'جلسة غير صالحة، يرجى تسجيل الدخول مجدداً 🔄' }),
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
                    error: 'لقد تجاوزت الحد المسموح من الطلبات. يرجى الانتظار قليلاً ⏳',
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

        // ─────────────────────────────────────────────
        // 3. Parse Request
        // ─────────────────────────────────────────────
        const { query, history = [], agentSlug = 'general' } = await req.json();
        if (!query || typeof query !== 'string') {
            throw new Error("No valid query provided");
        }
        console.log(`🧠 [Agent Brain] Received query for agent '${agentSlug}':`, query);

        // ─────────────────────────────────────────────
        // 4. Create Supabase Client & Fetch Agent
        // ─────────────────────────────────────────────
        const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

        // جلب الوكيل من قاعدة البيانات
        let agent: Agent = DEFAULT_AGENT;
        try {
            const { data: agentData, error: agentError } = await supabase
                .from('agents')
                .select('*')
                .eq('slug', agentSlug)
                .eq('is_active', true)
                .single();

            if (!agentError && agentData) {
                agent = agentData as Agent;
                console.log(`✅ Loaded agent: ${agent.name} (${agent.slug})`);

                // زيادة عداد الاستخدام
                await supabase.rpc('increment_agent_usage', { agent_slug: agent.slug }).catch(() => { });
            } else {
                console.log(`⚠️ Agent '${agentSlug}' not found, using default`);
            }
        } catch (e) {
            console.warn('Failed to load agent, using default:', e);
        }

        // فلترة الأدوات المتاحة للوكيل
        const enabledTools = TOOL_DEFINITIONS.filter(tool =>
            agent.tools_enabled.includes(tool.name)
        );

        // ─────────────────────────────────────────────
        // 5. First Gemini Call - Decide which tools to use
        // ─────────────────────────────────────────────
        console.log(`🤖 Phase 1: Tool Selection (Agent: ${agent.name})...`);

        // بناء system prompt مخصص للوكيل
        const agentSystemPrompt = `${agent.system_prompt}

قواعد استخدام الأدوات:
1. إذا سأل المستخدم عن أدوات، استخدم search_tools
2. إذا أراد مقارنة أدوات، استخدم compare_tools
3. إذا سأل عن أداة بعينها، استخدم get_tool_details
4. إذا أراد رؤية أدوات في فئة معينة، استخدم search_by_category
5. إذا سأل عن أفضل/أشهر الأدوات، استخدم get_popular_tools
6. يمكنك استخدام أكثر من أداة إذا لزم الأمر

المستخدم: ${query}`;

        const conversationHistory = history.slice(-4).map((msg: { role: string; content: string }) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const toolSelectionRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        ...conversationHistory,
                        { role: 'user', parts: [{ text: agentSystemPrompt }] }
                    ],
                    tools: enabledTools.length > 0 ? [{ functionDeclarations: enabledTools }] : undefined,
                    toolConfig: enabledTools.length > 0 ? {
                        functionCallingConfig: { mode: "AUTO" }
                    } : undefined,
                    generationConfig: {
                        temperature: 0.3,
                        topK: 20,
                        topP: 0.9,
                        maxOutputTokens: 1000,
                    }
                })
            }
        );

        if (!toolSelectionRes.ok) {
            const errText = await toolSelectionRes.text();
            console.error("🔴 Gemini API Error:", errText);
            throw new Error(`Gemini API Failed: ${errText}`);
        }

        const toolSelectionData = await toolSelectionRes.json();
        const candidate = toolSelectionData.candidates?.[0];
        const parts = candidate?.content?.parts || [];

        console.log("📤 Gemini response parts:", JSON.stringify(parts, null, 2));

        // ─────────────────────────────────────────────
        // 6. Execute Tools if requested
        // ─────────────────────────────────────────────
        const functionCalls = parts.filter((p: { functionCall?: FunctionCall }) => p.functionCall);
        const toolResults: Array<{ name: string; result: ExecutionResult }> = [];

        if (functionCalls.length > 0) {
            console.log(`🔧 Executing ${functionCalls.length} tool(s)...`);

            for (const part of functionCalls) {
                const fc = part.functionCall as FunctionCall;
                const result = await executeTool(fc, supabase, GEMINI_API_KEY);
                toolResults.push({ name: fc.name, result });
                console.log(`✅ Tool ${fc.name} executed:`, result.success ? "Success" : result.error);
            }
        }

        // ─────────────────────────────────────────────
        // 7. Second Gemini Call - Generate final response
        // ─────────────────────────────────────────────
        console.log("🤖 Phase 2: Response Generation...");

        // بناء سياق من نتائج الأدوات
        let toolContext = "";
        if (toolResults.length > 0) {
            toolContext = "\n═══ نتائج تنفيذ الأدوات ═══\n";
            for (const tr of toolResults) {
                if (tr.result.success) {
                    toolContext += `\n📌 ${tr.name}:\n${JSON.stringify(tr.result.data, null, 2)}\n`;
                } else {
                    toolContext += `\n⚠️ ${tr.name}: ${tr.result.error}\n`;
                }
            }
            toolContext += "\n═══════════════════════════\n";
        }

        const finalPrompt = `أنت "${agent.name}" ${agent.avatar_emoji}، ${agent.description || 'خبير ذكاء اصطناعي ودود ومحترف'}.
${agent.system_prompt}

قمت بتنفيذ أدوات للإجابة على سؤال المستخدم. استخدم النتائج التالية لصياغة رد مفيد ومختصر.

${toolContext}

تعليمات الرد:
1. تحدث بالعربية بنبرة ودية ومفيدة 🎯
2. اعرض الأدوات المناسبة مع شرح موجز لكل منها
3. إذا لم تجد نتائج، اعتذر واقترح بدائل
4. استخدم الإيموجي باعتدال
5. اجعل الرد مختصراً (3-5 نقاط)
6. اذكر روابط الأدوات إن وجدت بصيغة: /tool/[slug]

سؤال المستخدم: ${query}`;

        const finalRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
                    generationConfig: {
                        temperature: agent.temperature,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 800,
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

        if (!finalRes.ok) {
            const errText = await finalRes.text();
            throw new Error(`Final generation failed: ${errText}`);
        }

        const finalData = await finalRes.json();
        const reply = finalData.candidates?.[0]?.content?.parts?.[0]?.text ||
            "عذراً، واجهت مشكلة في التفكير. حاول مرة أخرى! 🔄";

        const executionTime = Math.round(performance.now() - startTime);
        console.log(`✅ Agent Brain completed in ${executionTime}ms`);

        // ─────────────────────────────────────────────
        // 8. Return Response
        // ─────────────────────────────────────────────
        return new Response(JSON.stringify({
            reply,
            answer: reply,
            agent: {
                slug: agent.slug,
                name: agent.name,
                emoji: agent.avatar_emoji
            },
            toolsExecuted: toolResults.map(t => ({
                name: t.name,
                success: t.result.success,
                itemsFound: Array.isArray(t.result.data) ? t.result.data.length :
                    (t.result.data as { tools?: unknown[] })?.tools?.length || (t.result.success ? 1 : 0)
            })),
            executionTime,
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
