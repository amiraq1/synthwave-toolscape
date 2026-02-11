import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { loadToolsData } from '@/data/toolsData';
import type { Tool } from './useTools';

/**
 * Fetch tool by ID - shared function for both query and prefetch
 */
export const fetchToolById = async (id: string): Promise<Tool> => {
  const toolId = String(id);
  const numericToolId = Number(id);
  if (!Number.isFinite(numericToolId)) {
    throw new Error('Invalid tool id');
  }
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('id', numericToolId)
    .maybeSingle();

  if (error || !data) {
    try {
      const tools = await loadToolsData();
      const localTool = tools.find((tool) => String(tool.id) === toolId);
      if (localTool) {
        return {
          ...localTool,
          id: String(localTool.id),
          features: localTool.features ? [...localTool.features] : null,
        } as unknown as Tool;
      }
    } catch {
      // Fallback to original error handling below.
    }
  }

  if (error) throw error;
  if (!data) throw new Error('Tool not found');

  // Transform to match Tool interface (id as string)
  return {
    ...data,
    id: String(data.id),
  } as unknown as Tool;
};

/**
 * Hook to fetch a single tool by ID
 */
export const useTool = (id: string | undefined) => {


  return useQuery({
    queryKey: ['tool', id],
    queryFn: () => fetchToolById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to prefetch tool data on hover
 */
export const usePrefetchTool = () => {
  const queryClient = useQueryClient();

  return (id: number | string) => {
    const toolId = String(id);

    const cached = queryClient.getQueryData(['tool', toolId]);
    if (!cached) {
      queryClient.prefetchQuery({
        queryKey: ['tool', toolId],
        queryFn: () => fetchToolById(toolId),
        staleTime: 1000 * 60 * 5,
      });
    }
  };
};
