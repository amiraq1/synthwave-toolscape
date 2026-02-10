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
            if (!query.trim() || query.trim().length < 2) {
                return { tools: [], posts: [], count: 0, semantic: false };
            }

            // Call the 'search' Edge Function
            const { data, error } = await supabase.functions.invoke<SearchResponse>('search', {
                body: {
                    query,
                    limit,
                    include_blog: includeBlog
                },
            });

            if (error) {
                console.error('Semantic search error:', error);
                throw error;
            }

            if (data?.error) {
                console.error('Search function error:', data.error);
                return { tools: [], posts: [], count: 0, semantic: false };
            }

            return data ?? { tools: [], posts: [], count: 0, semantic: false };
        },
        enabled: enabled && query.trim().length >= 2,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        retry: 1,
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
