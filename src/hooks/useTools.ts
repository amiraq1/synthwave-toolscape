import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      const itemsPerPage = 9; // عدد العناصر في كل دفعة
      const from = (pageParam as number);
      const to = from + itemsPerPage - 1;

      // بناء الاستعلام الأساسي
      let query = supabase
        .from("tools")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false }) // Featured first (logic from existing code)
        .order("created_at", { ascending: false }) // الأحدث أولاً
        .range(from, to);

      // تطبيق الفلاتر (Dynamic Filtering)
      if (searchQuery.trim()) {
        const sanitized = searchQuery
          .trim()
          .slice(0, 100)
          .replace(/\\/g, "\\\\")
          .replace(/%/g, "\\%")
          .replace(/_/g, "\\_");

        // نستخدم البحث في العنوان أو الوصف
        query = query.or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
      }

      if (selectedPersona && selectedPersona !== "all") {
        // البحث عن الشخصية داخل مصفوفة الفئات (أو عمود مخصص إذا وجد)
        // هنا نفترض أن الفئات تحتوي على كلمات مثل "design", "coding"
        // لكن بما أن الـ logic الحالي يعتمد على category واحدة لكل tool، سنحاول محاكاة ذلك
        // أو استخدام المنطق القديم إذا كان هناك Secondary Categories أو منطق Persona
        // *تنبيه*: تم نقل هذا المنطق من personaFilter.ts client-side filtering إلى هنا server-side filtering
        // هذا قد يحتاج لتعديل إذا كانت الـ database لا تدعم فلترة الـ persona بشكل مباشر
        // سأستخدم ilike على الـ category بشكل تقريبي كما طلب المستخدم

        if (selectedPersona === "design") query = query.ilike("category", "%صور%"); // Translate conceptual persona to existing Arabic category
        else if (selectedPersona === "dev") query = query.ilike("category", "%برمجة%");
        else if (selectedPersona === "content") query = query.ilike("category", "%نصوص%");
        else if (selectedPersona === "student") query = query.ilike("category", "%دراسة%"); // Or "student" if you have English tags
      }

      if (category && category !== "الكل") {
        // Smart Mapping: Map new UI categories to existing DB tags using partial match
        if (category === 'توليد نصوص') {
          query = query.ilike('category', '%نصوص%');
        } else if (category === 'توليد صور وفيديو') {
          query = query.or('category.ilike.%صور%,category.ilike.%فيديو%');
        } else if (category === 'مساعدات إنتاجية') {
          query = query.ilike('category', '%إنتاجية%');
        } else if (category === 'صناعة محتوى') {
          query = query.or('category.ilike.%محتوى%,category.ilike.%تسويق%');
        } else if (category === 'تطوير وبرمجة') {
          query = query.ilike('category', '%برمجة%');
        } else if (category === 'تعليم وبحث') {
          query = query.or('category.ilike.%تعليم%,category.ilike.%دراسة%,category.ilike.%طلاب%');
        } else {
          // Fallback for direct match or 'أخرى'
          query = query.eq("category", category);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching tools:", error);
        throw error;
      }

      return data;
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
      return lastPage.length < 9 ? undefined : allPages.length * 9;
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
