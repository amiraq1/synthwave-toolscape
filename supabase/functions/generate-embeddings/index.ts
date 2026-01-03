import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Tool {
    id: number;
    title: string;
    description: string;
    category: string;
    features: string[] | null;
}

// Google Gemini Embedding API
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "models/text-embedding-004",
                content: { parts: [{ text }] },
                taskType: "RETRIEVAL_DOCUMENT",
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    return data.embedding.values;
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const googleApiKey = Deno.env.get("GEMINI_API_KEY");
        if (!googleApiKey) {
            throw new Error("GEMINI_API_KEY is not set");
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { tool_id, batch_all } = await req.json();

        // Fetch tools to process
        let query = supabase
            .from("tools")
            .select("id, title, description, category, features");

        if (tool_id) {
            // Single tool
            query = query.eq("id", tool_id);
        } else if (batch_all) {
            // All tools without embeddings
            query = query.is("embedding", null);
        } else {
            throw new Error("Provide either tool_id or batch_all=true");
        }

        const { data: tools, error: fetchError } = await query;
        if (fetchError) throw fetchError;
        if (!tools || tools.length === 0) {
            return new Response(
                JSON.stringify({ message: "No tools to process" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const results = [];

        for (const tool of tools as Tool[]) {
            try {
                // Generate searchable text
                const searchText = [
                    tool.title,
                    tool.description,
                    tool.category,
                    ...(tool.features || []),
                ]
                    .filter(Boolean)
                    .join(" ");

                // Generate embedding using Google Gemini
                const embedding = await generateEmbedding(searchText, googleApiKey);

                // Update tool with embedding
                const { error: updateError } = await supabase
                    .from("tools")
                    .update({ embedding })
                    .eq("id", tool.id);

                if (updateError) {
                    console.error(`Update error for tool ${tool.id}:`, updateError);
                    results.push({ id: tool.id, success: false, error: updateError.message });
                } else {
                    results.push({ id: tool.id, success: true, dimensions: embedding.length });
                }
            } catch (err) {
                console.error(`Error for tool ${tool.id}:`, err);
                results.push({ id: tool.id, success: false, error: String(err) });
            }
        }

        return new Response(
            JSON.stringify({
                message: `Processed ${results.length} tools`,
                model: "text-embedding-004",
                results,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: String(error) }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
