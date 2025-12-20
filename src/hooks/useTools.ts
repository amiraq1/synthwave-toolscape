import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Category = 'الكل' | 'نصوص' | 'صور' | 'فيديو' | 'برمجة' | 'إنتاجية';

export interface Tool {
  id: number;
  title: string;
  description: string;
  category: string;
  url: string;
  image_url: string | null;
  pricing_type: string;
  is_featured: boolean;
}

export const categories: Category[] = ['الكل', 'نصوص', 'صور', 'فيديو', 'برمجة', 'إنتاجية'];

export const useTools = (searchQuery: string, activeCategory: Category) => {
  return useQuery({
    queryKey: ['tools', searchQuery, activeCategory],
    queryFn: async () => {
      let query = supabase.from('tools').select('*');

      // Apply category filter
      if (activeCategory !== 'الكل') {
        query = query.eq('category', activeCategory);
      }

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.order('is_featured', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Tool[];
    },
  });
};
