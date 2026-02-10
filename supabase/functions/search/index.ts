import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
    query: string;
    limit?: number;
    include_blog?: boolean;
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
    average_rating: number;
    reviews_count: number;
    is_featured: boolean;
    is_sponsored: boolean;
}

interface PostResult {
    id: string;
    title: string;
    excerpt: string;
    slug: string;
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
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const googleApiKey = Deno.env.get("GEMINI_API_KEY");
        if (!googleApiKey) throw new Error("GEMINI_API_KEY missing");

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const body: SearchRequest = await req.json();
        const { query, limit = 10, include_blog = false } = body;

        if (!query || typeof query !== 'string' || query.trim().length < 2) {
            return new Response(
                JSON.stringify({ tools: [], posts: [], message: "Query too short" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const cleanQuery = query.trim().toLowerCase();
        const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 50);

        // 1. Check Cache
        let queryEmbedding: number[] | null = null;
        const { data: cachedData } = await supabase
            .from('query_cache')
            .select('embedding')
            .eq('query_text', cleanQuery)
            .maybeSingle();

        if (cachedData) {
            queryEmbedding = typeof cachedData.embedding === 'string' ? JSON.parse(cachedData.embedding) : cachedData.embedding;
        } else {
            queryEmbedding = await generateEmbedding(cleanQuery, googleApiKey);
            await supabase.from('query_cache').insert({
                query_text: cleanQuery,
                embedding: queryEmbedding
            });
        }

        if (!queryEmbedding) throw new Error("Failed to get embedding");

        // 2. Search Tools with match_tools
        const { data: tools, error: toolError } = await supabase.rpc("match_tools", {
            query_embedding: queryEmbedding,
            match_threshold: 0.25, // Slightly lower for better recall
            match_count: safeLimit * 2 // Get more for reranking
        });

        if (toolError) throw toolError;

        // 3. Advanced Reranking Logic
        let processedTools = (tools as ToolResult[]) || [];
        processedTools = processedTools.map(tool => {
            // Reranking score: 70% similarity + 20% rating + 10% featured/sponsored
            const ratingScore = (tool.average_rating || 0) / 5;
            const boost = (tool.is_featured || tool.is_sponsored) ? 0.1 : 0;
            const finalScore = (tool.similarity * 0.7) + (ratingScore * 0.2) + boost;
            return { ...tool, rerank_score: finalScore };
        }).sort((a, b) => (b as any).rerank_score - (a as any).rerank_score).slice(0, safeLimit);

        // 4. Optional: Search Blog Posts (if requested)
        let processedPosts: PostResult[] = [];
        if (include_blog) {
            const { data: posts, error: postError } = await supabase.rpc("match_posts", {
                query_embedding: queryEmbedding,
                match_threshold: 0.3,
                match_count: 5
            });
            if (!postError) processedPosts = posts || [];
        }

        return new Response(
            JSON.stringify({
                tools: processedTools,
                posts: processedPosts,
                count: processedTools.length,
                semantic: true
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error: any) {
        console.error("❌ Search Error:", error);
        return new Response(
            JSON.stringify({ error: "Search failed", details: error.message, tools: [], semantic: false }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
