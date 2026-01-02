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
 * Requires OPENAI_API_KEY to be set in Supabase Edge Functions
 */
export const useSemanticSearch = ({
    query,
    threshold = 0.7,
    limit = 10,
    enabled = true,
}: SemanticSearchOptions) => {
    return useQuery<SemanticSearchResult[]>({
        queryKey: ['semantic-search', query, threshold, limit],
        queryFn: async () => {
            if (!query.trim()) return [];

            // Call the Edge Function to get embedding and search
            const { data, error } = await supabase.functions.invoke('semantic-search', {
                body: {
                    query,
                    match_threshold: threshold,
                    match_count: limit,
                },
            });

            if (error) {
                console.error('Semantic search error:', error);
                throw error;
            }

            return data?.tools || [];
        },
        enabled: enabled && query.trim().length > 2,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
};

/**
 * Hook for finding similar tools (recommendations)
 */
export const useSimilarTools = (toolId: number | string | undefined, limit = 5) => {
    return useQuery<Tool[]>({
        queryKey: ['similar-tools', toolId, limit],
        queryFn: async () => {
            if (!toolId) return [];

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
