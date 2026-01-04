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
        // SECURITY FIX: Use ANON_KEY instead of SERVICE_ROLE_KEY
        // This ensures RLS policies are respected and we don't bypass security
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { query, match_threshold = 0.7, match_count = 10 } = await req.json();

        // Input validation
        if (!query || typeof query !== "string") {
            return new Response(
                JSON.stringify({ error: "Query is required", tools: [] }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const trimmedQuery = query.trim();
        if (trimmedQuery.length < 2) {
            return new Response(
                JSON.stringify({ error: "Query too short", tools: [] }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Validate and cap parameters to prevent resource exhaustion
        const safeMatchCount = Math.min(Math.max(1, Number(match_count) || 10), 50);
        const safeThreshold = Math.min(Math.max(0, Number(match_threshold) || 0.7), 1);

        // Generate embedding for the search query using Google Gemini
        const queryEmbedding = await generateEmbedding(trimmedQuery, googleApiKey);

        // Call the match_tools function
        const { data: tools, error: searchError } = await supabase.rpc(
            "match_tools",
            {
                query_embedding: queryEmbedding,
                match_threshold: safeThreshold,
                match_count: safeMatchCount,
            }
        );

        if (searchError) {
            console.error("RPC Error:", searchError);
            throw new Error("Search failed");
        }

        return new Response(
            JSON.stringify({
                tools: tools || [],
                query: trimmedQuery,
                embedding_model: "text-embedding-004",
                dimensions: queryEmbedding.length,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({ error: "Search failed", tools: [] }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
