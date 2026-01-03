import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Category = 'الكل' | 'نصوص' | 'صور' | 'فيديو' | 'برمجة' | 'إنتاجية' | 'دراسة وطلاب' | 'صوت';

export interface Tool {
  id: number;
  title: string;
  description: string;
  category: string;
  url: string;
  image_url: string | null;
  pricing_type: string;
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
  alternatives?: number[] | null; // IDs of alternative tools
  // TAAFT-Style Fields
  tasks?: string[] | null; // Array of tasks/use-cases
  arabic_score?: number; // 0-10 scale for Arabic support quality
  release_date?: string | null; // ISO date for recency calculations
  clicks_count?: number; // Popularity tracking
  trending_score?: number; // Calculated score (from DB view/function)
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

      // TIMELINE SORTING: Sponsored first, then newest by release_date, fallback to created_at
      const { data, error } = await query
        .order('is_sponsored', { ascending: false, nullsFirst: false }) // الممول أولاً دائماً
        .order('release_date', { ascending: false, nullsFirst: false }) // ثم الأحدث تاريخاً (نظام Timeline)
        .order('created_at', { ascending: false })  // احتياطي للأدوات بدون تاريخ إصدار
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
