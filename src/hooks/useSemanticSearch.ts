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

interface SearchFunctionResponse {
    tools?: SemanticSearchResult[];
    error?: string;
    details?: string;
}

const CIRCUIT_BREAKER_MS = 5 * 60 * 1000;
const enabledValuePattern = /^(1|true|yes|on)$/i;
const disabledValuePattern = /^(0|false|no|off)$/i;

let semanticSearchDisabledUntil = 0;
let hasLoggedSemanticSearchWarning = false;

const semanticSearchEnabledByEnv = (() => {
    const rawValue = import.meta.env.VITE_ENABLE_SEMANTIC_SEARCH?.trim();

    if (rawValue) {
        if (enabledValuePattern.test(rawValue)) return true;
        if (disabledValuePattern.test(rawValue)) return false;
    }

    return !import.meta.env.DEV;
})();

const isSemanticSearchTemporarilyDisabled = () => Date.now() < semanticSearchDisabledUntil;

const disableSemanticSearchTemporarily = (reason: string) => {
    semanticSearchDisabledUntil = Date.now() + CIRCUIT_BREAKER_MS;

    if (hasLoggedSemanticSearchWarning) return;

    hasLoggedSemanticSearchWarning = true;
    console.warn(`[semantic-search] Disabled for 5 minutes. ${reason}`);
};

const extractFunctionErrorDetails = async (error: unknown): Promise<string> => {
    const functionError = error as { message?: string; context?: Response } | null;
    const response = functionError?.context;

    if (response) {
        try {
            const payload = await response.clone().json() as {
                details?: string;
                error?: string;
                message?: string;
            };

            return [payload.details, payload.message, payload.error].filter(Boolean).join(' ');
        } catch {
            try {
                return await response.clone().text();
            } catch {
                // Fall back to the SDK error message below.
            }
        }
    }

    return functionError?.message || 'Semantic search request failed.';
};

const isRecoverableServerFailure = (errorDetails: string) => {
    const normalizedDetails = errorDetails.toLowerCase();

    return normalizedDetails.includes('api key expired') ||
        normalizedDetails.includes('api_key_invalid') ||
        normalizedDetails.includes('embedding api error') ||
        normalizedDetails.includes('gemini_api_key missing') ||
        normalizedDetails.includes('search failed');
};

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
            if (!semanticSearchEnabledByEnv || isSemanticSearchTemporarilyDisabled()) return [];
            if (!query.trim() || query.trim().length < 2) return [];

            // Call the 'search' Edge Function
            const { data, error } = await supabase.functions.invoke<SearchFunctionResponse>('search', {
                body: {
                    query,
                    limit,
                },
            });

            if (error) {
                const errorDetails = await extractFunctionErrorDetails(error);
                const statusCode = (error as { context?: Response } | null)?.context?.status;

                if ((statusCode && statusCode >= 500) || isRecoverableServerFailure(errorDetails)) {
                    disableSemanticSearchTemporarily(errorDetails);
                }

                return [];
            }

            if (data?.error) {
                const errorDetails = typeof data.details === 'string'
                    ? data.details
                    : String(data.error);

                if (isRecoverableServerFailure(errorDetails)) {
                    disableSemanticSearchTemporarily(errorDetails);
                }

                return [];
            }

            return data?.tools || [];
        },
        enabled: semanticSearchEnabledByEnv &&
            enabled &&
            query.trim().length >= 2 &&
            !isSemanticSearchTemporarilyDisabled(),
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        retry: false,
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
