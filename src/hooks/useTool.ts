import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tool } from './useTools';

export const useTool = (id: string | undefined) => {
  return useQuery({
    queryKey: ['tool', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');
      
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('id', parseInt(id))
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Tool not found');

      return data as Tool;
    },
    enabled: !!id,
  });
};
