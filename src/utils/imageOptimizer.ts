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
        // Supabase يدعم التحويل إذا كانت ميزة Image Transformation مفعلة (في الباقة Pro)
        // أو يمكننا فقط إضافة معامل لتجنب الكاش القديم
        return `${url}?width=${width}&format=webp`;
    }

    // 3. باقي الروابط تعود كما هي
    return url;
};
