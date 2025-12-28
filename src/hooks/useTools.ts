import { useInfiniteQuery } from '@tanstack/react-query';
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
  features: string[] | null;
  average_rating?: number;
  reviews_count?: number;
}

export const categories: Category[] = ['الكل', 'نصوص', 'صور', 'فيديو', 'برمجة', 'إنتاجية'];

const PAGE_SIZE = 12;

export const useTools = (searchQuery: string, activeCategory: Category) => {
  return useInfiniteQuery<Tool[], Error>({
    queryKey: ['tools', searchQuery, activeCategory],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('tools')
        .select('*');

      // Apply category filter
      if (activeCategory !== 'الكل') {
        query = query.eq('category', activeCategory);
      }

      // Apply search filter with sanitized input to avoid pattern injection
      if (searchQuery.trim()) {
        const sanitized = searchQuery
          .trim()
          .slice(0, 100)
          .replace(/\\/g, "\\\\")
          .replace(/%/g, "\\%")
          .replace(/_/g, "\\_");

        query = query.or(
          `title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`
        );
      }

      const from = pageParam as number;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await query
        .order('is_featured', { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      return (data ?? []) as Tool[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer items than PAGE_SIZE, we've reached the end
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      // Otherwise, the next page starts after the current total
      return allPages.length * PAGE_SIZE;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });
};
