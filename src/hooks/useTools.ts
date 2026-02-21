import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = 'الكل' | 'توليد نصوص' | 'توليد صور وفيديو' | 'مساعدات إنتاجية' | 'صناعة محتوى' | 'تطوير وبرمجة' | 'تعليم وبحث' | 'أخرى';

export interface Tool {
  id: string | number;
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  category: string;
  created_at?: string;
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
  alternatives?: string[] | null;
  tasks?: string[];
  arabic_score?: number;
  release_date?: string | null;
  clicks_count?: number;
  trending_score?: number;
  views_count?: number;
  is_published?: boolean;
}

export const categories: Category[] = [
  'الكل',
  'توليد نصوص',
  'توليد صور وفيديو',
  'مساعدات إنتاجية',
  'صناعة محتوى',
  'تطوير وبرمجة',
  'تعليم وبحث',
  'أخرى'
];

interface UseToolsParams {
  searchQuery?: string;
  selectedPersona?: string;
  category?: Category;
  sortBy?: string;
}

export const useTools = (params: UseToolsParams = {}) => {
  const searchQuery = params.searchQuery || "";
  const selectedPersona = params.selectedPersona || "all";
  const category: Category = params.category || "الكل";
  const sortBy = params.sortBy || "trending";

  return useInfiniteQuery({
    queryKey: ["tools", selectedPersona, searchQuery, category, sortBy],

    queryFn: async ({ pageParam = 0 }) => {
      // Keep initial DOM lighter for faster first render and lower layout cost.
      const itemsPerPage = 8;
      const from = (pageParam as number) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Use select('*') — the DB schema has columns added after types.ts was generated
      // PostgREST validates column names strictly, so explicit lists risk 400 errors
      let query = supabase
        .from('tools')
        .select('*', { count: 'exact' })
        .eq('is_published', true);

      // 1. Search Filter — ILIKE for partial matching + FTS for word-level matching
      if (searchQuery.trim()) {
        const q = searchQuery.trim();
        // title.ilike = partial name matching (e.g. "chat" → "ChatGPT")
        // description.plfts = Full Text Search using plainto_tsquery (word-level)
        // With pg_trgm indexes from migration, ILIKE uses index scans
        query = query.or(
          `title.ilike.%${q}%,description.ilike.%${q}%`
        );
      }

      // 2. Persona Filter
      if (selectedPersona && selectedPersona !== "all") {
        const personaId = selectedPersona.toLowerCase();
        if (personaId === "designer" || personaId === "design") {
          query = query.or('category.ilike.%صور%,category.ilike.%تصميم%,category.ilike.%فيديو%');
        } else if (personaId === "developer" || personaId === "dev") {
          query = query.or('category.ilike.%برمجة%,category.ilike.%تطوير%,category.ilike.%code%');
        } else if (personaId === "marketer" || personaId === "content") {
          query = query.or('category.ilike.%تسويق%,category.ilike.%نصوص%,category.ilike.%محتوى%');
        } else if (personaId === "student") {
          query = query.or('category.ilike.%دراسة%,category.ilike.%تعليم%,category.ilike.%بحث%');
        }
      }

      // 3. Category Filter
      if (category && category !== "الكل") {
        if (category === 'توليد نصوص') query = query.ilike('category', '%نصوص%');
        else if (category === 'توليد صور وفيديو') query = query.or('category.ilike.%صور%,category.ilike.%فيديو%');
        else if (category === 'مساعدات إنتاجية') query = query.ilike('category', '%إنتاجية%');
        else if (category === 'صناعة محتوى') query = query.or('category.ilike.%محتوى%,category.ilike.%تسويق%');
        else if (category === 'تطوير وبرمجة') query = query.ilike('category', '%برمجة%');
        else if (category === 'تعليم وبحث') query = query.or('category.ilike.%تعليم%,category.ilike.%دراسة%,category.ilike.%طلاب%');
        // 'أخرى' is handled by exclusion or just showing general things if not strict
      }

      // Sorting dynamically based on selected option
      if (params.sortBy) {
        switch (params.sortBy) {
          case 'trending':
            // Trending prioritizes featured first, then clicks
            query = query.order('is_featured', { ascending: false })
              .order('clicks_count', { ascending: false, nullsFirst: false })
              .order('created_at', { ascending: false });
            break;
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'top_rated':
            query = query.order('average_rating', { ascending: false, nullsFirst: false })
              .order('reviews_count', { ascending: false, nullsFirst: false });
            break;
          case 'popular':
          case 'fastest': // Using fastest as popular for now
            query = query.order('views_count', { ascending: false, nullsFirst: false })
              .order('clicks_count', { ascending: false, nullsFirst: false });
            break;
          case 'alphabetical':
            query = query.order('title', { ascending: true });
            break;
          default:
            query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
        }
      } else {
        // Default sorting
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
      }

      // Pagination
      const { data, error, count } = await query.range(from, to);

      if (error) {
        console.error("Error fetching tools:", error);
        throw error;
      }

      return { data: (data as unknown as Tool[]) || [], count };
    },

    initialPageParam: 0,

    getNextPageParam: (lastPage: any, allPages: any) => {
      // lastPage is { data, count }
      const totalFetched = allPages.flatMap((p: any) => p.data).length;
      const totalCount = lastPage.count || 0;

      if (totalFetched >= totalCount) return undefined;
      return allPages.length; // Next page index
    },

    select: (data) => ({
      pages: data.pages.map((page: any) => page.data),
      pageParams: data.pageParams,
    }),

    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnMount: false,
  });
};
