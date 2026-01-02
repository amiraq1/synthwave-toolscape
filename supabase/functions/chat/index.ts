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
        const error = await response.text();
        throw new Error(`Gemini Embedding API error: ${error}`);
    }

    const data = await response.json();
    return data.embedding.values;
}

// Helper: Generate Chat Response (using Gemini 1.5 Flash)
async function generateChatResponse(prompt: string, apiKey: string, history: any[] = []) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
        const error = await response.text();
        throw new Error(`Gemini Chat API error: ${error}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

Deno.serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
        if (!googleApiKey) throw new Error("GOOGLE_API_KEY is not set");

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { query, history = [] } = await req.json() as ChatRequest;

        if (!query) throw new Error("Query is required");

        // 1. Generate Embedding for user query
        const queryEmbedding = await generateEmbedding(query, googleApiKey);

        // 2. Search for relevant tools using RPC
        const { data: tools, error: searchError } = await supabase.rpc("match_tools", {
            query_embedding: queryEmbedding,
            match_threshold: 0.5, // Slightly lower threshold for broader context
            match_count: 5
        });

        if (searchError) throw searchError;

        // 3. Construct Context from found tools
        const toolList = (tools as Tool[]) || [];
        const contextText = toolList.map(t =>
            `- **${t.title}** (${t.pricing_type}): ${t.description}. [الرابط](${t.url})`
        ).join("\n");

        // 4. Construct System Prompt (The Persona)
        const systemPrompt = `
    أنت "نبض AI" (Nabd AI)، المستشار الذكي لمنصة "نبض" المتخصصة في أدوات الذكاء الاصطناعي.
    هدفُك هو مساعدة المستخدمين العرب في العثور على أفضل أدوات الـ AI التي تناسب احتياجاتهم وميزانيتهم بدقة.

    التعليمات الصارمة:
    1.  **المصدر:** اعتمد حصراً على المعلومات الواردة في "السياق" (Context) أدناه للإجابة. لا تخترع أدوات غير موجودة.
    2.  **اللغة:** تحدث باللغة العربية بطلاقة، بأسلوب ودود، مشجع، ومهني.
    3.  **التنسيق:**
        -   اجعل أسماء الأدوات بالخط العريض (**اسم الأداة**).
        -   اذكر السعر بجانب الاسم (مثلاً: **ChatGPT** - مجاني).
        -   قدم روابط الأدوات دائماً بهذا الشكل: [زيارة الموقع](الرابط).
        -   استخدم القوائم النقطية لتسهيل القراءة.
        -   استخدم الإيموجي المناسب لإضفاء الحيوية (✨، 💡، 🚀).
    4.  **في حال عدم توفر المعلومة:** إذا لم تجد في السياق أدوات تناسب سؤال المستخدم، اعتذر بلطف، وقل: "للأسف، لا تتوفر لدي حالياً معلومات حول أدوات بهذا الوصف في قاعدة بياناتي، لكنني أتعلم باستمرار!".
    
    السياق (الأدوات المقترحة من قاعدة البيانات):
    ${contextText}

    سؤال المستخدم: ${query}
    `;

        // 5. Generate Response
        // We send the systemPrompt + query combined as the last message for simplicity with the stateless history provided
        // Ideally, for Gemini, we can use system_instruction, but putting it in the prompt works well too.
        const answer = await generateChatResponse(systemPrompt, googleApiKey, []);

        return new Response(
            JSON.stringify({
                answer,
                tools: toolList
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: String(error) }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
