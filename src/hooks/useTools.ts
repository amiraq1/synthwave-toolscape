import { useInfiniteQuery } from "@tanstack/react-query";
import { loadToolsData } from "@/data/toolsData";

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
}

export const useTools = (params: UseToolsParams = {}) => {
  const searchQuery = params.searchQuery || "";
  const selectedPersona = params.selectedPersona || "all";
  const category: Category = params.category || "الكل";

  return useInfiniteQuery({
    queryKey: ["tools", selectedPersona, searchQuery, category],

    queryFn: async ({ pageParam = 0 }) => {
      const itemsPerPage = 12;
      const from = pageParam as number;
      const to = from + itemsPerPage;

      const tools = await loadToolsData();
      let filteredTools = tools.filter(t => t.is_published);

      // 1. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        filteredTools = filteredTools.filter(t =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        );
      }

      // 2. Persona Filter
      if (selectedPersona && selectedPersona !== "all") {
        const personaId = selectedPersona.toLowerCase();
        filteredTools = filteredTools.filter(t => {
          const cat = t.category || "";
          if (personaId === "designer" || personaId === "design") return cat.includes("صور") || cat.includes("تصميم");
          if (personaId === "developer" || personaId === "dev") return cat.includes("برمجة") || cat.includes("تطوير");
          if (personaId === "marketer" || personaId === "content") return cat.includes("نصوص") || cat.includes("تسويق");
          if (personaId === "student") return cat.includes("دراسة") || cat.includes("تعليم");
          return true;
        });
      }

      // 3. Category Filter
      if (category && category !== "الكل") {
        filteredTools = filteredTools.filter(t => {
          const cat = t.category;
          if (category === 'توليد نصوص') return cat.includes('نصوص');
          if (category === 'توليد صور وفيديو') return cat.includes('صور') || cat.includes('فيديو');
          if (category === 'مساعدات إنتاجية') return cat.includes('إنتاجية');
          if (category === 'صناعة محتوى') return cat.includes('محتوى') || cat.includes('تسويق');
          if (category === 'تطوير وبرمجة') return cat.includes('برمجة');
          if (category === 'تعليم وبحث') return cat.includes('تعليم') || cat.includes('دراسة') || cat.includes('طلاب');
          // 'أخرى' — anything not matching above categories
          return !['نصوص', 'صور', 'فيديو', 'إنتاجية', 'محتوى', 'تسويق', 'برمجة', 'تعليم', 'دراسة', 'طلاب', 'صوت'].some(k => cat.includes(k));
        });
      }

      // Sorting: Featured first
      filteredTools.sort((a, b) => {
        if (a.is_featured === b.is_featured) return 0;
        return a.is_featured ? -1 : 1;
      });

      // Pagination — no artificial delay
      const result = filteredTools.slice(from, to);

      return result as unknown as Tool[];
    },

    initialPageParam: 0,

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,

    getNextPageParam: (lastPage: Tool[], allPages: Tool[][]) => {
      return lastPage.length < 12 ? undefined : allPages.length * 12;
    },

    select: (data) => {
      return {
        pages: data.pages.map((page) =>
          page.map((item) => ({
            ...item,
            id: String(item.id),
          } as unknown as Tool))
        ),
        pageParams: data.pageParams,
      };
    },

    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
};
