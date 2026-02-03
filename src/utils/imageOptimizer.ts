/**
 * دالة لتحسين روابط الصور تلقائياً
 * @param url الرابط الأصلي
 * @param width العرض المطلوب (لتقليل الحجم)
 * @returns الرابط المحسن
 */
export const optimizeImage = (url: string | undefined, width = 800): string => {
    if (!url) return "/placeholder.svg"; // صورة افتراضية

    // 1. تحسين صور Unsplash
    if (url.includes("images.unsplash.com")) {
        return `${url}&w=${width}&q=80&fm=webp`;
    }

    // 2. تحسين صور Supabase Storage
    if (url.includes("supabase.co/storage")) {
        // تم إزالة معاملات التحويل (width/format) لأنها تتطلب باقة Pro في Supabase
        // وتسبب خطأ 404 إذا لم تكن مفعلة.
        return url;
    }

    // 3. باقي الروابط تعود كما هي
    return url;
};
