import { useInfiniteQuery } from "@tanstack/react-query";
import { localTools } from "@/data/localTools";

export type Category = 'الكل' | 'توليد نصوص' | 'توليد صور وفيديو' | 'مساعدات إنتاجية' | 'صناعة محتوى' | 'تطوير وبرمجة' | 'تعليم وبحث' | 'أخرى';

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

// تعريف أنواع المدخلات للبحث
interface UseToolsParams {
  searchQuery?: string;
  selectedPersona?: string; // الفلتر الجديد
  category?: Category;
}

// دمجنا المعاملات في كائن واحد (params) بدلاً من وسائط منفصلة
export const useTools = (searchQueryOrParams: string | UseToolsParams, activeCategoryOld?: Category) => {

  // Normalization logic: support both old signature and new object signature
  let searchQuery = "";
  let selectedPersona = "all";
  let category: Category = "الكل";

  if (typeof searchQueryOrParams === 'string') {
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
    // 1. تحسين مفاتيح الاستعلام (Query Keys) ✅
    // الآن الكاش سيفصل بين نتائج "المصممين" ونتائج "المبرمجين"
    // أي تغيير في هذه المصفوفة سيؤدي لجلب بيانات جديدة تلقائياً
    queryKey: ["tools", selectedPersona, searchQuery, category],

    queryFn: async ({ pageParam = 0 }) => {
      const itemsPerPage = 12;
      const from = (pageParam as number);
      const to = from + itemsPerPage;

      // START LOCAL FILTERING LOGIC
      let filteredTools = localTools.filter(t => t.is_published);

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
          return cat === category;
        });
      }

      // Sorting: Featured first, then by Creation Date (Mocked logic since specific dates might be uniform in CSV)
      filteredTools.sort((a, b) => {
        if (a.is_featured === b.is_featured) return 0;
        return a.is_featured ? -1 : 1;
      });

      // Pagination
      const result = filteredTools.slice(from, to);

      // Simulate network delay for better UX (optional)
      await new Promise(resolve => setTimeout(resolve, 300));

      return result;
    },

    initialPageParam: 0,

    // 2. تحسين إعدادات الوقت (Stale & GC Time) ✅
    // staleTime: الفترة التي تعتبر فيها البيانات "طازجة" ولا تحتاج لإعادة جلب (قللناها لـ 5 دقائق)
    staleTime: 1000 * 60 * 5,
    // gcTime: الفترة التي تبقى فيها البيانات غير المستخدمة في الذاكرة قبل حذفها (30 دقيقة ممتازة)
    gcTime: 1000 * 60 * 30,

    getNextPageParam: (lastPage, allPages) => {
      // إذا كانت الصفحة الحالية فارغة أو أقل من العدد المطلوب، فلا توجد صفحات تالية
      // lastPage is Tool[]
      return lastPage.length < 12 ? undefined : allPages.length * 12;
    },

    // 3. استخدام دالة Select للتحويل (Data Transformation) ✅
    // هذه الدالة تعمل *بعد* الجلب و *قبل* أن تصل للمكون
    // هنا نستخدمها لضمان أننا لا نمرر أي حقول حساسة أو غير ضرورية للواجهة
    select: (data) => {
      return {
        pages: data.pages.map((page) =>
          page.map((item) => ({
            ...item,
            id: String(item.id),
            // مثال: تحويل السعر لرقم مقروء أو إضافة حقل مشتق
            // is_new: new Date(tool.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // جديد إذا كان أقل من أسبوع
          } as unknown as Tool)) // Force cast to match interface
        ),
        pageParams: data.pageParams,
      };
    },
    refetchOnMount: false, // استخدام الكاش
    placeholderData: (previousData) => previousData, // عرض البيانات القديمة أثناء التحديث
  });
};
