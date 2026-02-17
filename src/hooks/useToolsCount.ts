import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ToolsStats {
    total_tools: number;
    total_categories: number;
    arabic_tools: number;
    free_tools: number;
}

/**
 * Lightweight hook to fetch total published tools count.
 * Uses the `get_tools_stats` RPC if available, otherwise falls back
 * to a simple count query.
 */
export const useToolsStats = () => {
    return useQuery<ToolsStats>({
        queryKey: ['tools-stats'],
        queryFn: async () => {
            // Try RPC first (fast, single call for all stats)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: rpcData, error: rpcError } = await (supabase as any)
                .rpc('get_tools_stats');

            if (!rpcError && rpcData) {
                return rpcData as unknown as ToolsStats;
            }

            // Fallback: simple count query (works without running the migration)
            const { count, error } = await supabase
                .from('tools')
                .select('*', { count: 'exact', head: true })
                .eq('is_published', true);

            if (error) {
                console.error('Error fetching tools count:', error);
            }

            return {
                total_tools: count ?? 0,
                total_categories: 0,
                arabic_tools: 0,
                free_tools: 0,
            };
        },
        staleTime: 1000 * 60 * 30, // 30 minutes — stats don't change often
        gcTime: 1000 * 60 * 60,    // 1 hour garbage collection
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
};

export default useToolsStats;
