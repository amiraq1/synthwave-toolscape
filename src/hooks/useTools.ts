import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { supabase, isSupabaseNetworkError } from "@/integrations/supabase/client";
import { getToolsPageFromCatalog } from "@/lib/toolsCatalogFallback";

export type Category =
  | "الكل"
  | "نصوص"
  | "صور"
  | "فيديو"
  | "برمجة"
  | "إنتاجية"
  | "دراسة وطلاب"
  | "صوت";

export interface Tool {
  id: string;
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
  is_published?: boolean;
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
  "الكل",
  "نصوص",
  "صور",
  "فيديو",
  "برمجة",
  "إنتاجية",
  "دراسة وطلاب",
  "صوت",
];

interface UseToolsParams {
  searchQuery?: string;
  selectedPersona?: string;
  category?: Category;
}

interface ToolsPage {
  data: Tool[];
  count: number | null;
}

interface UseToolsData {
  pages: Tool[][];
  pageParams: number[];
  totalCount: number;
}

export const useTools = (
  searchQueryOrParams: string | UseToolsParams = "",
  activeCategoryOld?: Category,
) => {
  let searchQuery = "";
  let selectedPersona = "all";
  let category: Category = "الكل";

  if (typeof searchQueryOrParams === "string") {
    searchQuery = searchQueryOrParams;
    if (activeCategoryOld) {
      category = activeCategoryOld;
    }
  } else {
    searchQuery = searchQueryOrParams.searchQuery || "";
    selectedPersona = searchQueryOrParams.selectedPersona || "all";
    category = searchQueryOrParams.category || "الكل";
  }

  const itemsPerPage = 9;
  const queryKey = ["tools", selectedPersona, searchQuery, category] as const;

  return useInfiniteQuery<ToolsPage, Error, UseToolsData, typeof queryKey, number>({
    queryKey,
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from("tools")
        .select("*", { count: "exact" })
        .eq("is_published", true)
        .order("clicks_count", { ascending: false, nullsFirst: false })
        .order("views_count", { ascending: false, nullsFirst: false })
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (searchQuery.trim()) {
        const sanitized = searchQuery
          .trim()
          .slice(0, 100)
          .replace(/\\/g, "\\\\")
          .replace(/%/g, "\\%")
          .replace(/_/g, "\\_");

        query = query.or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
      }

      if (selectedPersona && selectedPersona !== "all") {
        if (selectedPersona === "designer" || selectedPersona === "design") {
          query = query.ilike("category", "%صور%");
        } else if (selectedPersona === "developer" || selectedPersona === "dev") {
          query = query.ilike("category", "%برمجة%");
        } else if (selectedPersona === "marketer" || selectedPersona === "content") {
          query = query.ilike("category", "%نصوص%");
        } else if (selectedPersona === "student") {
          query = query.ilike("category", "%دراسة%");
        }
      }

      if (category && category !== "الكل") {
        query = query.eq("category", category);
      }

      try {
        const { data, error, count } = await query;

        if (error) {
          throw error;
        }

        return {
          data: (data ?? []) as Tool[],
          count,
        };
      } catch (error) {
        if (isSupabaseNetworkError(error)) {
          const fallbackPage = await getToolsPageFromCatalog({
            category,
            offset: from,
            pageSize: itemsPerPage,
            searchQuery,
            selectedPersona,
          });

          return {
            data: fallbackPage.data,
            count: fallbackPage.count ?? fallbackPage.data.length,
          };
        }

        console.error("Error fetching tools:", error);
        throw error;
      }
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    getNextPageParam: (lastPage, allPages) => {
      const totalCount = lastPage.count ?? 0;
      const totalFetched = allPages.reduce((sum, page) => sum + page.data.length, 0);

      if (totalCount > 0 && totalFetched >= totalCount) {
        return undefined;
      }

      return lastPage.data.length < itemsPerPage ? undefined : allPages.length * itemsPerPage;
    },
    select: (data: InfiniteData<ToolsPage, number>) => ({
      pages: data.pages.map((page) =>
        page.data.map(
          (item) =>
            ({
              ...item,
              id: String(item.id),
            }) as Tool,
        ),
      ),
      pageParams: data.pageParams,
      totalCount:
        data.pages[0]?.count ??
        data.pages.reduce((sum, page) => sum + page.data.length, 0),
    }),
    retry: (failureCount, error) => !isSupabaseNetworkError(error) && failureCount < 2,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
};
