import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
        if (!openaiApiKey) {
            throw new Error("OPENAI_API_KEY is not set");
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { query, match_threshold = 0.7, match_count = 10 } = await req.json();

        if (!query || typeof query !== "string") {
            throw new Error("Query is required");
        }

        // Generate embedding for the search query
        const embeddingResponse = await fetch(
            "https://api.openai.com/v1/embeddings",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${openaiApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "text-embedding-3-small",
                    input: query,
                }),
            }
        );

        if (!embeddingResponse.ok) {
            const error = await embeddingResponse.text();
            throw new Error(`OpenAI API error: ${error}`);
        }

        const embeddingData = await embeddingResponse.json();
        const queryEmbedding = embeddingData.data[0].embedding;

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
                embedding_model: "text-embedding-3-small",
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
