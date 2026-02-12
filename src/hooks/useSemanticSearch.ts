import { useQuery } from '@tanstack/react-query';
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

// Renamed to force HMR update and break old cache references
export const useSemanticSearchFixed = ({
    query,
    limit = 15,
    enabled = true,
}: SemanticSearchOptions) => {
    return useQuery<SearchResponse>({
        queryKey: ['semantic-search-fixed', query, limit], // New key
        queryFn: async () => {
            return EMPTY_SEARCH_RESPONSE;
        },
        enabled: false,
        staleTime: Infinity,
    });
};

export const useHybridSearch = (
    query: string,
    clientSideResultsCount: number,
    minResultsThreshold: number = 3
) => {
    return {
        semanticTools: [],
        semanticPosts: [],
        isSemanticLoading: false,
        isSemanticError: false,
        semanticError: null,
        isSemantic: false,
        shouldUseSemantic: false,
    };
};

export const useSimilarTools = (toolId: number | string | undefined, limit = 5) => {
    return useQuery<Tool[]>({
        queryKey: ['similar-tools-fixed', toolId, limit],
        queryFn: async () => {
            return [];
        },
        enabled: false,
        staleTime: Infinity,
    });
};

// Backup export for files I might miss, but deprecated
export const useSemanticSearch = useSemanticSearchFixed;

export default useSemanticSearchFixed;
