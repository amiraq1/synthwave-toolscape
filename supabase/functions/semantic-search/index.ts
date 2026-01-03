import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
                taskType: "RETRIEVAL_QUERY",
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

        const { query, match_threshold = 0.7, match_count = 10 } = await req.json();

        if (!query || typeof query !== "string") {
            throw new Error("Query is required");
        }

        // Generate embedding for the search query using Google Gemini
        const queryEmbedding = await generateEmbedding(query, googleApiKey);

        // Call the match_tools function
        const { data: tools, error: searchError } = await supabase.rpc(
            "match_tools",
            {
                query_embedding: queryEmbedding,
                match_threshold,
                match_count,
            }
        );

        if (searchError) {
            throw searchError;
        }

        return new Response(
            JSON.stringify({
                tools: tools || [],
                query,
                embedding_model: "text-embedding-004",
                dimensions: queryEmbedding.length,
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
