import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase, isSupabaseNetworkError } from "@/integrations/supabase/client";
import { getToolsPageFromCatalog } from "@/lib/toolsCatalogFallback";

export type Category = "الكل" | "نصوص" | "صور" | "فيديو" | "برمجة" | "إنتاجية" | "دراسة وطلاب" | "صوت";

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

export const categories: Category[] = ["الكل", "نصوص", "صور", "فيديو", "برمجة", "إنتاجية", "دراسة وطلاب", "صوت"];

interface UseToolsParams {
  searchQuery?: string;
  selectedPersona?: string;
  category?: Category;
}

export const useTools = (searchQueryOrParams: string | UseToolsParams, activeCategoryOld?: Category) => {
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

  return useInfiniteQuery({
    queryKey: ["tools", selectedPersona, searchQuery, category],
    queryFn: async ({ pageParam = 0 }) => {
      const itemsPerPage = 9;
      const from = pageParam as number;
      const to = from + itemsPerPage - 1;

      let query = supabase
        .from("tools")
        .select("*")
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
        if (selectedPersona === "design") query = query.ilike("category", "%صور%");
        else if (selectedPersona === "dev") query = query.ilike("category", "%برمجة%");
        else if (selectedPersona === "content") query = query.ilike("category", "%نصوص%");
        else if (selectedPersona === "student") query = query.ilike("category", "%دراسة%");
      }

      if (category && category !== "الكل") {
        query = query.eq("category", category);
      }

      try {
        const { data, error } = await query;

        if (error) {
          throw error;
        }

        return (data ?? []) as Tool[];
      } catch (error) {
        if (isSupabaseNetworkError(error)) {
          const fallbackPage = await getToolsPageFromCatalog({
            category,
            offset: from,
            pageSize: itemsPerPage,
            searchQuery,
            selectedPersona,
          });

          return fallbackPage.data;
        }

        console.error("Error fetching tools:", error);
        throw error;
      }
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < 9 ? undefined : allPages.length * 9;
    },
    select: (data) => {
      return {
        pages: data.pages.map((page) =>
          page.map((item) => ({
            ...item,
            id: String(item.id),
          } as Tool))
        ),
        pageParams: data.pageParams,
      };
    },
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
};
