import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tool } from './useTools';

/**
 * Fetch tool by ID - shared function for both query and prefetch
 */
export const fetchToolById = async (id: string): Promise<Tool> => {
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('id', parseInt(id))
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Tool not found');

  return data as Tool;
};

/**
 * Hook to fetch a single tool by ID
 */
export const useTool = (id: string | undefined) => {
  return useQuery({
    queryKey: ['tool', id],
    queryFn: () => fetchToolById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

/**
 * Hook to prefetch tool data on hover
 * Usage: const prefetch = usePrefetchTool();
 *        onMouseEnter={() => prefetch(tool.id)}
 */
export const usePrefetchTool = () => {
  const queryClient = useQueryClient();

  return (id: number | string) => {
    const toolId = String(id);

    // Only prefetch if not already in cache
    const cached = queryClient.getQueryData(['tool', toolId]);
    if (!cached) {
      queryClient.prefetchQuery({
        queryKey: ['tool', toolId],
        queryFn: () => fetchToolById(toolId),
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    }
  };
};
