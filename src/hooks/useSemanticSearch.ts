import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tool } from './useTools';

interface SemanticSearchOptions {
    query: string;
    threshold?: number;
    limit?: number;
    enabled?: boolean;
}

interface SemanticSearchResult extends Tool {
    similarity: number;
}

/**
 * Hook for semantic search using vector embeddings
 * Uses the 'search' Edge Function with Gemini embeddings
 */
export const useSemanticSearch = ({
    query,
    threshold = 0.3,
    limit = 15,
    enabled = true,
}: SemanticSearchOptions) => {
    return useQuery<SemanticSearchResult[]>({
        queryKey: ['semantic-search', query, threshold, limit],
        queryFn: async () => {
            if (!query.trim() || query.trim().length < 2) return [];

            // Call the 'search' Edge Function
            const { data, error } = await supabase.functions.invoke('search', {
                body: {
                    query,
                    limit,
                },
            });

            if (error) {
                console.error('Semantic search error:', error);
                throw error;
            }

            if (data?.error) {
                console.error('Search function error:', data.error);
                return [];
            }

            return data?.tools || [];
        },
        enabled: enabled && query.trim().length >= 2,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        retry: 1,
    });
};

/**
 * Hook for hybrid search: combines client-side filtering with semantic fallback
 * Automatically triggers semantic search when client-side results are insufficient
 */
export const useHybridSearch = (
    query: string,
    clientSideResultsCount: number,
    minResultsThreshold: number = 3
) => {
    // Only enable semantic search when:
    // 1. Query is at least 2 characters
    // 2. Client-side search found less than threshold results
    const shouldUseSemantic =
        query.trim().length >= 2 &&
        clientSideResultsCount < minResultsThreshold;

    const semanticSearch = useSemanticSearch({
        query,
        enabled: shouldUseSemantic,
        limit: 15,
    });

    return {
        semanticTools: semanticSearch.data || [],
        isSemanticLoading: semanticSearch.isLoading,
        isSemanticError: semanticSearch.isError,
        semanticError: semanticSearch.error,
        isSemantic: shouldUseSemantic && (semanticSearch.data?.length || 0) > 0,
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

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any).rpc('find_similar_tools', {
                tool_id: typeof toolId === 'string' ? parseInt(toolId, 10) : toolId,
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
