import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tool } from "./useTools";

interface SemanticSearchOptions {
    query: string;
    threshold?: number;
    limit?: number;
    enabled?: boolean;
    includeBlog?: boolean;
}

export interface SemanticSearchResult extends Tool {
    similarity: number;
    rerank_score?: number;
}

export interface BlogSearchResult {
    id: string;
    title: string;
    excerpt: string;
    slug: string;
    similarity: number;
}

export interface SearchResponse {
    tools: SemanticSearchResult[];
    posts: BlogSearchResult[];
    count: number;
    semantic: boolean;
    error?: string;
}

const MIN_QUERY_LENGTH = 2;
const INTERACTIVE_STALE_TIME_MS = 1000 * 45;

const EMPTY_SEARCH_RESPONSE: SearchResponse = {
    tools: [],
    posts: [],
    count: 0,
    semantic: false,
};

const buildSafeResponse = (data?: Partial<SearchResponse> | null): SearchResponse => ({
    tools: data?.tools ?? [],
    posts: data?.posts ?? [],
    count: data?.count ?? (data?.tools?.length ?? 0),
    semantic: Boolean(data?.semantic),
    error: data?.error,
});

export const useSemanticSearchFixed = ({
    query,
    limit = 15,
    enabled = true,
    includeBlog = true,
}: SemanticSearchOptions) => {
    const normalizedQuery = query.trim();
    const isEnabled = enabled && normalizedQuery.length >= MIN_QUERY_LENGTH;

    return useQuery<SearchResponse>({
        queryKey: ["semantic-search", normalizedQuery, limit, includeBlog],
        enabled: isEnabled,
        staleTime: INTERACTIVE_STALE_TIME_MS,
        queryFn: async () => {
            try {
                const { data, error } = await supabase.functions.invoke<Partial<SearchResponse>>("search", {
                    body: {
                        query: normalizedQuery,
                        limit,
                        include_blog: includeBlog,
                    },
                });

                if (error) {
                    console.error("Semantic search invoke error:", error);
                    return EMPTY_SEARCH_RESPONSE;
                }

                return buildSafeResponse(data);
            } catch (invokeError) {
                console.error("Semantic search unexpected error:", invokeError);
                return EMPTY_SEARCH_RESPONSE;
            }
        },
    });
};

export const useHybridSearch = (
    query: string,
    clientSideResultsCount: number,
    minResultsThreshold: number = 3,
) => {
    const normalizedQuery = query.trim();
    const shouldUseSemantic = normalizedQuery.length >= MIN_QUERY_LENGTH && clientSideResultsCount < minResultsThreshold;

    const semanticQuery = useSemanticSearchFixed({
        query: normalizedQuery,
        enabled: shouldUseSemantic,
        limit: 15,
        includeBlog: true,
    });

    return {
        semanticTools: shouldUseSemantic ? semanticQuery.data?.tools ?? [] : [],
        semanticPosts: shouldUseSemantic ? semanticQuery.data?.posts ?? [] : [],
        isSemanticLoading: shouldUseSemantic ? semanticQuery.isLoading : false,
        isSemanticError: shouldUseSemantic ? semanticQuery.isError : false,
        semanticError: shouldUseSemantic ? semanticQuery.error : null,
        isSemantic: shouldUseSemantic && Boolean(semanticQuery.data?.semantic),
        shouldUseSemantic,
    };
};

export const useSimilarTools = (toolId: number | string | undefined, limit = 5) => {
    const numericToolId = Number(toolId);
    const isEnabled = Number.isFinite(numericToolId) && numericToolId > 0;

    return useQuery<Tool[]>({
        queryKey: ["similar-tools", numericToolId, limit],
        enabled: isEnabled,
        staleTime: 1000 * 60,
        queryFn: async () => {
            try {
                const { data: currentTool, error: currentToolError } = await supabase
                    .from("tools")
                    .select("category")
                    .eq("id", numericToolId)
                    .maybeSingle();

                if (currentToolError || !currentTool?.category) {
                    if (currentToolError) {
                        console.error("Unable to fetch current tool for similar search:", currentToolError);
                    }
                    return [];
                }

                const { data: similarTools, error: similarToolsError } = await supabase
                    .from("tools")
                    .select("*")
                    .eq("is_published", true)
                    .eq("category", currentTool.category)
                    .neq("id", numericToolId)
                    .limit(limit);

                if (similarToolsError) {
                    console.error("Unable to fetch similar tools:", similarToolsError);
                    return [];
                }

                return (similarTools as Tool[]) ?? [];
            } catch (error) {
                console.error("Unexpected similar tools error:", error);
                return [];
            }
        },
    });
};

export const useSemanticSearch = useSemanticSearchFixed;

export default useSemanticSearchFixed;
