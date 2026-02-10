import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tool } from './useTools';

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

const EMPTY_SEARCH_RESPONSE: SearchResponse = {
    tools: [],
    posts: [],
    count: 0,
    semantic: false,
};

const SEMANTIC_COOLDOWN_MS = 5 * 60 * 1000;
let semanticServiceDisabledUntil = 0;
let semanticFailureLogged = false;
let semanticRequestInFlight = false;

const isSemanticServiceDisabled = () => Date.now() < semanticServiceDisabledUntil;

const temporarilyDisableSemanticService = (details?: string) => {
    semanticServiceDisabledUntil = Date.now() + SEMANTIC_COOLDOWN_MS;
    if (!semanticFailureLogged) {
        console.warn(
            `Semantic search disabled for ${SEMANTIC_COOLDOWN_MS / 60000} minutes due to backend errors.`,
            details || "",
        );
        semanticFailureLogged = true;
    }
};

type FindSimilarToolsRpc = (
    fn: "find_similar_tools",
    args: {
        tool_id: number | string;
        limit_count: number;
    }
) => Promise<{ data: Tool[] | null; error: Error | null }>;

/**
 * Hook for semantic search using vector embeddings
 * Uses the 'search' Edge Function with Gemini embeddings and Reranking
 */
export const useSemanticSearch = ({
    query,
    limit = 15,
    enabled = true,
    includeBlog = true,
}: SemanticSearchOptions) => {
    return useQuery<SearchResponse>({
        queryKey: ['semantic-search', query, limit, includeBlog],
        queryFn: async () => {
            const normalizedQuery = query.trim();
            if (!normalizedQuery || normalizedQuery.length < 2) {
                return EMPTY_SEARCH_RESPONSE;
            }

            if (isSemanticServiceDisabled()) {
                return EMPTY_SEARCH_RESPONSE;
            }

            // Prevent duplicate concurrent calls from multiple semantic consumers.
            if (semanticRequestInFlight) {
                return EMPTY_SEARCH_RESPONSE;
            }

            semanticRequestInFlight = true;

            try {
                // Call the 'search' Edge Function
                const { data, error } = await supabase.functions.invoke<SearchResponse>('search', {
                    body: {
                        query: normalizedQuery,
                        limit,
                        include_blog: includeBlog
                    },
                });

                if (error) {
                    temporarilyDisableSemanticService(error.message);
                    return EMPTY_SEARCH_RESPONSE;
                }

                if (data?.error) {
                    temporarilyDisableSemanticService(data.error);
                    return EMPTY_SEARCH_RESPONSE;
                }

                return data ?? EMPTY_SEARCH_RESPONSE;
            } finally {
                semanticRequestInFlight = false;
            }
        },
        enabled: enabled && query.trim().length >= 2,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        retry: false,
    });
};

/**
 * Hook for hybrid search: combines client-side filtering with semantic fallback
 */
export const useHybridSearch = (
    query: string,
    clientSideResultsCount: number,
    minResultsThreshold: number = 3
) => {
    const shouldUseSemantic =
        query.trim().length >= 2 &&
        clientSideResultsCount < minResultsThreshold;

    const semanticSearch = useSemanticSearch({
        query,
        enabled: shouldUseSemantic,
        limit: 15,
    });

    return {
        semanticTools: semanticSearch.data?.tools || [],
        semanticPosts: semanticSearch.data?.posts || [],
        isSemanticLoading: semanticSearch.isLoading,
        isSemanticError: semanticSearch.isError,
        semanticError: semanticSearch.error,
        isSemantic: shouldUseSemantic && (semanticSearch.data?.tools?.length || 0) > 0,
        shouldUseSemantic,
    };
};

/**
 * Hook for finding similar tools (recommendations)
 */
export const useSimilarTools = (toolId: number | string | undefined, limit = 5) => {
    return useQuery<Tool[]>({
        queryKey: ['similar-tools', toolId, limit],
        queryFn: async () => {
            if (!toolId) return [];

            const rpc = supabase.rpc as unknown as FindSimilarToolsRpc;
            const { data, error } = await rpc('find_similar_tools', {
                tool_id: toolId,
                limit_count: limit,
            });

            if (error) {
                console.error('Similar tools error:', error);
                throw error;
            }

            return (data || []) as Tool[];
        },
        enabled: !!toolId,
        staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    });
};

export default useSemanticSearch;
