const categoryLabels: Record<string, { en: string; ar: string }> = {
  "الكل": { en: "All", ar: "الكل" },
  "نصوص": { en: "Text", ar: "نصوص" },
  "صور": { en: "Image", ar: "صور" },
  "فيديو": { en: "Video", ar: "فيديو" },
  "برمجة": { en: "Coding", ar: "برمجة" },
  "إنتاجية": { en: "Productivity", ar: "إنتاجية" },
  "دراسة وطلاب": { en: "Study & Students", ar: "دراسة وطلاب" },
  "صوت": { en: "Audio", ar: "صوت" },
  "توليد نصوص": { en: "Text Generation", ar: "توليد نصوص" },
  "توليد صور وفيديو": { en: "Image & Video Generation", ar: "توليد صور وفيديو" },
  "مساعدات إنتاجية": { en: "Productivity Assistants", ar: "مساعدات إنتاجية" },
  "صناعة محتوى": { en: "Content Creation", ar: "صناعة محتوى" },
  "تطوير وبرمجة": { en: "Development & Coding", ar: "تطوير وبرمجة" },
  "تعليم وبحث": { en: "Education & Research", ar: "تعليم وبحث" },
  "أخرى": { en: "Other", ar: "أخرى" },
};

const pricingLabels: Record<string, { en: string; ar: string }> = {
  "مجاني": { en: "Free", ar: "مجاني" },
  "مجاني بالكامل": { en: "Completely Free", ar: "مجاني بالكامل" },
  "مدفوع": { en: "Paid", ar: "مدفوع" },
  "تجربة مجانية": { en: "Free Trial", ar: "تجربة مجانية" },
  "مجاني / مدفوع": { en: "Freemium", ar: "مجاني / مدفوع" },
  "Free": { en: "Free", ar: "مجاني" },
  "Freemium": { en: "Freemium", ar: "مجاني / مدفوع" },
  "Paid": { en: "Paid", ar: "مدفوع" },
};

export type PricingTier = "free" | "freemium" | "paid" | "trial" | "unknown";

export const getCategoryLabel = (category: string | undefined | null, isAr: boolean): string => {
  if (!category) return isAr ? "غير محدد" : "Uncategorized";
  return categoryLabels[category]?.[isAr ? "ar" : "en"] ?? category;
};

export const getPricingLabel = (pricing: string | undefined | null, isAr: boolean): string => {
  if (!pricing) return isAr ? "غير محدد" : "Not specified";
  return pricingLabels[pricing]?.[isAr ? "ar" : "en"] ?? pricing;
};

export const getPricingTier = (pricing: string | undefined | null): PricingTier => {
  if (!pricing) return "unknown";

  const normalized = pricing.toLowerCase();
  if (normalized.includes("freemium") || pricing === "مجاني / مدفوع") return "freemium";
  if (normalized.includes("trial") || pricing === "تجربة مجانية") return "trial";
  if (normalized === "free" || pricing === "مجاني" || pricing === "مجاني بالكامل") return "free";
  if (normalized === "paid" || pricing === "مدفوع") return "paid";

  return "unknown";
};
