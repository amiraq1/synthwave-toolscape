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
    title_en?: string;
    description: string;
    description_en?: string;
    category: string;
    pricing_type: string;
    url: string;
    image_url: string | null;
    similarity: number;
}

interface QueryCacheRow {
    embedding: number[] | string | null;
}

const NVIDIA_EMBEDDING_MODEL = "nvidia/llama-nemotron-embed-1b-v2";

const buildUnavailableResponse = (message: string) =>
    new Response(
        JSON.stringify({
            tools: [],
            count: 0,
            semantic: false,
            message,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

async function generateGeminiEmbedding(text: string, apiKey: string): Promise<number[]> {
    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
                model: "models/gemini-embedding-001",
                content: { parts: [{ text }] },
                taskType: "RETRIEVAL_QUERY",
                outputDimensionality: 768,
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

async function generateNvidiaEmbedding(text: string, apiKey: string): Promise<number[]> {
    const response = await fetch("https://integrate.api.nvidia.com/v1/embeddings", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            input: [text],
            input_type: "query",
            model: NVIDIA_EMBEDDING_MODEL,
            dimensions: 768,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NVIDIA Embedding Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.data?.[0]?.embedding ?? [];
}

async function generateEmbedding(text: string, geminiApiKey?: string | null, nvidiaApiKey?: string | null): Promise<number[]> {
    if (nvidiaApiKey) {
        try {
            const embedding = await generateNvidiaEmbedding(text, nvidiaApiKey);
            if (embedding.length > 0) {
                return embedding;
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (!geminiApiKey) {
                throw error;
            }
            console.warn("NVIDIA embedding unavailable, falling back to Gemini:", message);
        }
    }

    if (!geminiApiKey) {
        throw new Error("No embedding provider configured");
    }

    const fallbackEmbedding = await generateGeminiEmbedding(text, geminiApiKey);
    if (fallbackEmbedding.length === 0) {
        throw new Error("Embedding API Error: empty embedding");
    }

    return fallbackEmbedding;
}

Deno.serve(async (req) => {
    // Handle CORS
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        console.log("--- Semantic Search Started ---");

        // 1. Environment Check
        const googleApiKey = Deno.env.get("GEMINI_API_KEY");
        const nvidiaApiKey = Deno.env.get("NVIDIA_API_KEY");
        if (!googleApiKey && !nvidiaApiKey) {
            console.warn("Semantic search unavailable: no embedding provider configured");
            return buildUnavailableResponse("Semantic search unavailable");
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        // SECURITY FIX: Use ANON_KEY instead of SERVICE_ROLE_KEY
        // This ensures RLS policies are respected and we don't bypass security
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        // 2. Parse Request
        const body: SearchRequest = await req.json();
        const { query, limit = 10 } = body;

        // Input validation
        if (!query || typeof query !== 'string') {
            return new Response(
                JSON.stringify({ tools: [], message: "Query is required" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const trimmedQuery = query.trim();
        if (trimmedQuery.length < 2) {
            return new Response(
                JSON.stringify({ tools: [], message: "Query too short" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Validate and cap limit to prevent resource exhaustion
        const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 50);

        console.log("Search Query:", trimmedQuery);

        const cacheKey = trimmedQuery.toLowerCase();
        let queryEmbedding: number[] | null = null;

        const { data: cachedQuery } = await supabase
            .from("query_cache")
            .select("embedding")
            .eq("query_text", cacheKey)
            .maybeSingle<QueryCacheRow>();

        if (cachedQuery?.embedding) {
            queryEmbedding = typeof cachedQuery.embedding === "string"
                ? JSON.parse(cachedQuery.embedding)
                : cachedQuery.embedding;
            console.log("Using cached query embedding");
        } else {
            // 3. Generate Embedding for the query
            queryEmbedding = await generateEmbedding(trimmedQuery, googleApiKey, nvidiaApiKey);
            console.log("Embedding generated successfully");

            const { error: cacheError } = await supabase
                .from("query_cache")
                .insert({ query_text: cacheKey, embedding: queryEmbedding });

            if (cacheError) {
                console.warn("Failed to cache query embedding:", cacheError);
            }
        }

        // 4. Search using match_tools RPC
        const { data: tools, error: searchError } = await supabase.rpc("match_tools", {
            query_embedding: queryEmbedding,
            match_threshold: 0.3, // Lower threshold for broader results
            match_count: safeLimit
        });

        if (searchError) {
            console.error("RPC Error:", searchError);
            throw new Error(`Search failed: ${JSON.stringify(searchError)}`);
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

    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : 'Unknown error';

        if (
            errMessage.includes("GEMINI_API_KEY missing") ||
            errMessage.includes("API key expired") ||
            errMessage.includes("API_KEY_INVALID") ||
            errMessage.includes("Embedding API Error: 400") ||
            errMessage.includes("Embedding API Error: 401") ||
            errMessage.includes("Embedding API Error: 403") ||
            errMessage.includes("Embedding API Error: 429") ||
            errMessage.includes("NVIDIA Embedding Error: 401") ||
            errMessage.includes("NVIDIA Embedding Error: 402") ||
            errMessage.includes("NVIDIA Embedding Error: 403") ||
            errMessage.includes("NVIDIA Embedding Error: 429") ||
            errMessage.includes("RESOURCE_EXHAUSTED") ||
            errMessage.toLowerCase().includes("quota exceeded")
        ) {
            console.warn("Semantic search unavailable:", errMessage);
            return buildUnavailableResponse("Semantic search unavailable");
        }

        console.error("❌ Search Fatal Error:", error);
        return new Response(
            JSON.stringify({
                error: "Search failed",
                details: errMessage, // Expose error details solely for debugging purpose
                tools: [],
                semantic: false
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
