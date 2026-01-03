import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Types
interface ChatRequest {
    query: string;
    history?: { role: "user" | "model"; parts: string }[];
}

interface Tool {
    id: number;
    title: string;
    description: string;
    category: string;
    pricing_type: string;
    url: string;
    similarity: number;
}

// Helper: Generate Embedding (using Gemini text-embedding-004)
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
    console.log("Generating embedding for query...");
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "models/text-embedding-004",
                content: { parts: [{ text }] },
                taskType: "RETRIEVAL_QUERY",
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini Embedding API Error: Status ${response.status}`, errorText);
        throw new Error(`Gemini Embedding API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Embedding generated successfully.");
    return data.embedding.values;
}

// Helper: Generate Chat Response (using Gemini 1.5 Flash)
async function generateChatResponse(prompt: string, apiKey: string, history: any[] = []) {
    console.log("Generating chat response...");
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    ...history.map(h => ({
                        role: h.role,
                        parts: [{ text: h.parts }]
                    })),
                    { role: "user", parts: [{ text: prompt }] }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                }
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini Chat API Error: Status ${response.status}`, errorText);
        throw new Error(`Gemini Chat API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Chat response generated successfully.");
    return data.candidates[0].content.parts[0].text;
}

Deno.serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        console.log("--- Chat Function Started ---");

        // 1. Env Check
        const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
        if (!googleApiKey) {
            console.error("GOOGLE_API_KEY is missing from environment variables.");
            throw new Error("Server misconfiguration: GOOGLE_API_KEY missing");
        }
        console.log("GOOGLE_API_KEY is present.");

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        // 2. Authenticate User (Require JWT)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            console.log("No Authorization header provided.");
            return new Response(
                JSON.stringify({ error: 'يجب تسجيل الدخول لاستخدام نبض AI' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Create authenticated Supabase client
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

        if (authError || !user) {
            console.log("Auth failed:", authError?.message || "No user found");
            return new Response(
                JSON.stringify({ error: 'غير مصرح: يرجى تسجيل الدخول لاستخدام نبض AI' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log("User authenticated:", user.id);

        // Create service client for database operations
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 2. Parse Request
        let body: ChatRequest;
        try {
            body = await req.json();
        } catch (e) {
            console.error("Failed to parse request body:", e);
            throw new Error("Invalid JSON body");
        }

        const { query, history = [] } = body;
        console.log("Received Query:", query);

        if (!query) throw new Error("Query is required");

        // 3. Generate Embedding
        let queryEmbedding: number[];
        try {
            queryEmbedding = await generateEmbedding(query, googleApiKey);
        } catch (e) {
            console.error("Failed step: Generate Embedding", e);
            throw e;
        }

        // 4. Search relevant tools
        console.log("Searching for compatible tools in DB...");
        const { data: tools, error: searchError } = await supabase.rpc("match_tools", {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: 5
        });

        if (searchError) {
            console.error("Supabase RPC match_tools Error:", searchError);
            throw new Error(`Database Search Failed: ${searchError.message}`);
        }

        const toolList = (tools as Tool[]) || [];
        console.log(`Found ${toolList.length} relevant tools.`);

        // 5. Construct Context
        const contextText = toolList.map(t =>
            `- **${t.title}** (${t.pricing_type}): ${t.description}. [الرابط](${t.url})`
        ).join("\n");

        // 6. System Prompt
        const systemPrompt = `
    أنت "نبض AI" (Nabd AI)، المستشار الذكي لمنصة "نبض".
    هدفُك هو مساعدة المستخدمين العرب في العثور على أفضل أدوات الـ AI.

    التعليمات:
    1. اعتمد حصراً على "السياق" أدناه. لا تخترع أدوات.
    2. تحدث بالعربية بودية واحترافية.
    3. نسق الإجابة بذكاء (Bold للأسماء، روابط Markdown).
    4. إذا لم تجد أدوات مناسبة في السياق، اعتذر واقترح بحثاً عاماً، لكن لا ترشح أدوات من خارج السياق.

    السياق (الأدوات المقترحة):
    ${contextText}

    سؤال المستخدم: ${query}
    `;

        // 7. Generate Chat Response
        let answer;
        try {
            answer = await generateChatResponse(systemPrompt, googleApiKey, []); // Stateless for now to keep it simple with contexts
        } catch (e: any) {
            console.error("Failed step: Generate Chat Response", e);

            // DEBUG: If 404/400, try to list models
            if (e.message.includes("404") || e.message.includes("400")) {
                console.log("Attempting to list available models for debugging...");
                try {
                    const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${googleApiKey}`);
                    const listData = await listResp.json();
                    const modelNames = listData.models ? listData.models.map((m: any) => m.name).join(", ") : "No models returned";
                    console.log("Available Models:", modelNames);
                    throw new Error(`Gemini Error: ${e.message} - AVAILABLE MODELS TO THIS KEY: ${modelNames}`);
                } catch (listErr) {
                    console.error("Failed to list models", listErr);
                }
            }
            throw e;
        }

        console.log("Sending successful response.");
        return new Response(
            JSON.stringify({
                answer,
                tools: toolList
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        console.error("--- Chat Function Failed ---");
        console.error("Error Details:", error.message || error);

        return new Response(
            JSON.stringify({
                error: error.message || "An internal error occurred",
                details: String(error)
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
