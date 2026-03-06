import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tool } from './useTools';

/**
 * Fetch tool by ID - shared function for both query and prefetch
 */
const parseToolId = (id: string | number | undefined | null): number | null => {
  if (typeof id === 'number') {
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  if (typeof id !== 'string') {
    return null;
  }

  const trimmed = id.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

export const fetchToolById = async (id: string | number): Promise<Tool> => {
  const parsedId = parseToolId(id);

  if (parsedId === null) {
    throw new Error('Invalid tool ID');
  }

  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('id', parsedId)
    .maybeSingle();

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
  const parsedId = parseToolId(id);

  return useQuery({
    queryKey: ['tool', id],
    queryFn: () => fetchToolById(parsedId!),
    enabled: parsedId !== null,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to prefetch tool data on hover
 */
export const usePrefetchTool = () => {
  const queryClient = useQueryClient();

  return (id: number | string) => {
    const parsedId = parseToolId(id);
    if (parsedId === null) {
      return;
    }

    const toolId = String(parsedId);

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
