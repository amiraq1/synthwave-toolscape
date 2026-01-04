import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Category = 'الكل' | 'نصوص' | 'صور' | 'فيديو' | 'برمجة' | 'إنتاجية' | 'دراسة وطلاب' | 'صوت';

export interface Tool {
  id: string; // Changed to string for consistency
  title: string;
  description: string;
  category: string;
  secondary_categories?: string[];
  url: string;
  image_url: string | null;
  pricing_type: string;
  pricing_details?: {
    free?: { features: string[]; limits?: string };
    pro?: { price: string; features: string[]; billing?: string };
    enterprise?: { features: string[]; contact?: boolean };
  } | null;
  is_featured: boolean;
  is_sponsored?: boolean;
  sponsor_expiry?: string | null;
  supports_arabic?: boolean;
  coupon_code?: string | null;
  deal_expiry?: string | null;
  features: string[] | null;
  screenshots?: string[] | null;
  average_rating?: number;
  reviews_count?: number;
  video_url?: string | null;
  faqs?: { question: string; answer: string }[] | null;
  alternatives?: string[] | null; // IDs are strings now
  // TAAFT-Style Fields
  tasks?: string[];
  arabic_score?: number;
  release_date?: string | null;
  clicks_count?: number;
  trending_score?: number;
}

export const categories: Category[] = ['الكل', 'نصوص', 'صور', 'فيديو', 'برمجة', 'إنتاجية', 'دراسة وطلاب', 'صوت'];

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

      // Sort by featured first, then newest
      const { data, error } = await query
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      // Transform data to match interface (convert id from number to string)
      const transformedData = (data ?? []).map(item => ({
        ...item,
        id: String(item.id),
        // Ensure other fields match too if needed, but 'as Tool[]' handles optional props mostly
      }));

      return transformedData as unknown as Tool[];
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
