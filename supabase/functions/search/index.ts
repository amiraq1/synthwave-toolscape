import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_EMBEDDING_MODEL = "models/gemini-embedding-001";

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

interface RerankedToolResult extends ToolResult {
    rerank_score: number;
}

interface PostResult {
    id: string;
    title: string;
    excerpt: string;
    slug: string;
    similarity: number;
}

interface SearchResponse {
    tools: ToolResult[];
    posts: PostResult[];
    count: number;
    semantic: boolean;
    fallback?: "keyword";
}

interface KeywordToolRow {
    id: number;
    title: string | null;
    title_en: string | null;
    description: string | null;
    description_en: string | null;
    category: string | null;
    pricing_type: string | null;
    url: string | null;
    image_url: string | null;
    average_rating: number | null;
    reviews_count: number | null;
    is_featured: boolean | null;
    is_sponsored: boolean | null;
}

interface KeywordPostRow {
    id: string;
    title: string | null;
    excerpt: string | null;
    slug: string | null;
}

type SupabaseClient = ReturnType<typeof createClient>;

const jsonResponse = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

const sanitizeForILike = (value: string) =>
    value.replace(/[,%]/g, " ").replace(/\s+/g, " ").trim();

const parseEmbedding = (value: unknown): number[] | null => {
    if (Array.isArray(value) && value.every((item) => typeof item === "number")) {
        return value;
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return parseEmbedding(parsed);
        } catch {
            return null;
        }
    }

    if (value && typeof value === "object" && "values" in value) {
        const maybeValues = (value as { values?: unknown }).values;
        if (Array.isArray(maybeValues) && maybeValues.every((item) => typeof item === "number")) {
            return maybeValues;
        }
    }

    return null;
};

async function generateEmbedding(text: string, apiKey: string, model: string): Promise<number[]> {
    const modelPath = model.startsWith("models/") ? model : `models/${model}`;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:embedContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: modelPath,
            content: { parts: [{ text }] },
            taskType: "RETRIEVAL_QUERY",
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Embedding API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const values = parseEmbedding((data as { embedding?: unknown })?.embedding);
    if (!values || values.length === 0) {
        throw new Error("Embedding response was empty");
    }

    return values;
}

async function keywordFallbackSearch(
    supabase: SupabaseClient,
    rawQuery: string,
    limit: number,
    includeBlog: boolean,
): Promise<SearchResponse> {
    const safeQuery = sanitizeForILike(rawQuery);
    if (!safeQuery) {
        return { tools: [], posts: [], count: 0, semantic: false, fallback: "keyword" };
    }

    const likePattern = `%${safeQuery}%`;
    const toolColumns =
        "id,title,title_en,description,description_en,category,pricing_type,url,image_url,average_rating,reviews_count,is_featured,is_sponsored";

    const { data: toolRows, error: toolsError } = await supabase
        .from("tools")
        .select(toolColumns)
        .eq("is_published", true)
        .or(
            `title.ilike.${likePattern},description.ilike.${likePattern},title_en.ilike.${likePattern},description_en.ilike.${likePattern}`,
        )
        .order("is_featured", { ascending: false })
        .order("reviews_count", { ascending: false })
        .limit(limit);

    if (toolsError) {
        throw toolsError;
    }

    const tools: ToolResult[] = ((toolRows as KeywordToolRow[] | null) ?? []).map((tool) => ({
        id: Number(tool.id),
        title: tool.title ?? "",
        title_en: tool.title_en ?? undefined,
        description: tool.description ?? "",
        description_en: tool.description_en ?? undefined,
        category: tool.category ?? "",
        pricing_type: tool.pricing_type ?? "unknown",
        url: tool.url ?? "",
        image_url: tool.image_url ?? null,
        similarity: 0,
        average_rating: Number(tool.average_rating ?? 0),
        reviews_count: Number(tool.reviews_count ?? 0),
        is_featured: Boolean(tool.is_featured),
        is_sponsored: Boolean(tool.is_sponsored),
    }));

    let posts: PostResult[] = [];
    if (includeBlog) {
        const { data: postRows, error: postsError } = await supabase
            .from("posts")
            .select("id,title,excerpt,slug")
            .eq("is_published", true)
            .or(`title.ilike.${likePattern},excerpt.ilike.${likePattern}`)
            .order("created_at", { ascending: false })
            .limit(5);

        if (!postsError) {
            posts = ((postRows as KeywordPostRow[] | null) ?? []).map((post) => ({
                id: post.id,
                title: post.title ?? "",
                excerpt: post.excerpt ?? "",
                slug: post.slug ?? "",
                similarity: 0,
            }));
        }
    }

    return {
        tools,
        posts,
        count: tools.length,
        semantic: false,
        fallback: "keyword",
    };
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
        return jsonResponse({ error: "Supabase environment variables are missing" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
        const body: SearchRequest = await req.json();
        const { query, limit = 10, include_blog = false } = body;

        if (!query || typeof query !== "string" || query.trim().length < 2) {
            return jsonResponse({ tools: [], posts: [], count: 0, semantic: false, message: "Query too short" });
        }

        const cleanQuery = query.trim().toLowerCase();
        const safeLimit = Math.min(Math.max(1, Number(limit) || 10), 50);
        const googleApiKey = Deno.env.get("GEMINI_API_KEY");
        const embeddingModel = Deno.env.get("GEMINI_EMBEDDING_MODEL") || DEFAULT_EMBEDDING_MODEL;

        if (!googleApiKey) {
            return jsonResponse(await keywordFallbackSearch(supabase, cleanQuery, safeLimit, include_blog));
        }

        let queryEmbedding: number[] | null = null;
        const { data: cachedData } = await supabase
            .from("query_cache")
            .select("embedding")
            .eq("query_text", cleanQuery)
            .maybeSingle();

        if (cachedData) {
            queryEmbedding = parseEmbedding((cachedData as { embedding?: unknown }).embedding);
        }

        if (!queryEmbedding) {
            try {
                queryEmbedding = await generateEmbedding(cleanQuery, googleApiKey, embeddingModel);
            } catch (embeddingError) {
                console.error("Embedding generation failed, switching to keyword fallback:", embeddingError);
                return jsonResponse(await keywordFallbackSearch(supabase, cleanQuery, safeLimit, include_blog));
            }

            await supabase.from("query_cache").upsert(
                {
                    query_text: cleanQuery,
                    embedding: queryEmbedding,
                },
                { onConflict: "query_text" },
            );
        }

        if (!queryEmbedding) {
            return jsonResponse(await keywordFallbackSearch(supabase, cleanQuery, safeLimit, include_blog));
        }

        let tools: ToolResult[] = [];
        try {
            const { data: rpcTools, error: toolError } = await supabase.rpc("match_tools", {
                query_embedding: queryEmbedding,
                match_threshold: 0.25,
                match_count: safeLimit * 2,
            });

            if (toolError) {
                throw toolError;
            }

            const reranked: RerankedToolResult[] = ((rpcTools as ToolResult[] | null) ?? []).map((tool) => {
                const ratingScore = (tool.average_rating || 0) / 5;
                const boost = tool.is_featured || tool.is_sponsored ? 0.1 : 0;
                const finalScore = tool.similarity * 0.7 + ratingScore * 0.2 + boost;
                return { ...tool, rerank_score: finalScore };
            });

            tools = reranked.sort((a, b) => b.rerank_score - a.rerank_score).slice(0, safeLimit);
        } catch (toolSearchError) {
            console.error("match_tools failed, switching to keyword fallback:", toolSearchError);
            return jsonResponse(await keywordFallbackSearch(supabase, cleanQuery, safeLimit, include_blog));
        }

        let posts: PostResult[] = [];
        if (include_blog) {
            const { data: rpcPosts, error: postError } = await supabase.rpc("match_posts", {
                query_embedding: queryEmbedding,
                match_threshold: 0.3,
                match_count: 5,
            });

            if (!postError) {
                posts = (rpcPosts as PostResult[] | null) ?? [];
            }
        }

        return jsonResponse({
            tools,
            posts,
            count: tools.length,
            semantic: true,
        });
    } catch (error: unknown) {
        console.error("Search Error:", error);
        const details = error instanceof Error ? error.message : "Unknown error";
        return jsonResponse({ error: "Search failed", details, tools: [], posts: [], semantic: false }, 500);
    }
});
