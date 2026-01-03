import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
    query: string;
    limit?: number;
}

interface ToolResult {
    id: number;
    title: string;
    description: string;
    category: string;
    pricing_type: string;
    url: string;
    image_url: string | null;
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
        const errorText = await response.text();
        throw new Error(`Embedding API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.embedding.values;
}

Deno.serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        console.log("--- Semantic Search Started ---");

        // 1. Environment Check
        const googleApiKey = Deno.env.get("GOOGLE_API_KEY");
        if (!googleApiKey) {
            throw new Error("GOOGLE_API_KEY missing");
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 2. Parse Request
        const body: SearchRequest = await req.json();
        const { query, limit = 10 } = body;

        if (!query || query.trim().length < 2) {
            return new Response(
                JSON.stringify({ tools: [], message: "Query too short" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log("Search Query:", query);

        // 3. Generate Embedding for the query
        const queryEmbedding = await generateEmbedding(query, googleApiKey);
        console.log("Embedding generated successfully");

        // 4. Search using match_tools RPC
        const { data: tools, error: searchError } = await supabase.rpc("match_tools", {
            query_embedding: queryEmbedding,
            match_threshold: 0.3, // Lower threshold for broader results
            match_count: limit
        });

        if (searchError) {
            console.error("RPC Error:", searchError);
            throw new Error(`Search Failed: ${searchError.message}`);
        }

        const results = (tools as ToolResult[]) || [];
        console.log(`Found ${results.length} semantic matches`);

        return new Response(
            JSON.stringify({
                tools: results,
                count: results.length,
                semantic: true
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        console.error("Search Error:", error.message);
        return new Response(
            JSON.stringify({
                error: error.message || "Search failed",
                tools: [],
                semantic: false
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
