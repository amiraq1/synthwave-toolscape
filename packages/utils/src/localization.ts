const categoryLabels: Record<string, string> = {
  // Arabic categories (already in DB)
  "الكل": "الكل",
  "نصوص": "نصوص",
  "صور": "صور",
  "فيديو": "فيديو",
  "برمجة": "برمجة",
  "إنتاجية": "إنتاجية",
  "دراسة وطلاب": "دراسة وطلاب",
  "صوت": "صوت",
  "توليد نصوص": "توليد نصوص",
  "توليد صور وفيديو": "توليد صور وفيديو",
  "مساعدات إنتاجية": "مساعدات إنتاجية",
  "صناعة محتوى": "صناعة محتوى",
  "تطوير وبرمجة": "تطوير وبرمجة",
  "تعليم وبحث": "تعليم وبحث",
  "أخرى": "أخرى",
  // English categories from DB -> Arabic
  "Personal Assistant": "مساعد شخصي",
  "Text Generation": "توليد نصوص",
  "Image Generation": "توليد صور",
  "Video Generation": "توليد فيديو",
  "Audio Generation": "توليد صوت",
  "Code Generation": "توليد أكواد",
  "Content Creation": "صناعة محتوى",
  "Productivity": "إنتاجية",
  "Education": "تعليم",
  "Research": "بحث",
  "Marketing": "تسويق",
  "SEO": "تحسين محركات البحث",
  "Writing": "كتابة",
  "Design": "تصميم",
  "Music": "موسيقى",
  "Business": "أعمال",
  "Finance": "مالية",
  "Healthcare": "رعاية صحية",
  "Legal": "قانوني",
  "HR": "موارد بشرية",
  "Sales": "مبيعات",
  "Customer Support": "دعم العملاء",
  "Social Media": "وسائل التواصل",
  "Email": "بريد إلكتروني",
  "Data Analysis": "تحليل بيانات",
  "Automation": "أتمتة",
  "Chatbot": "روبوت محادثة",
  "Translation": "ترجمة",
  "Summarization": "تلخيص",
  "Transcription": "تفريغ صوتي",
  "Speech": "كلام",
  "Gaming": "ألعاب",
  "Art": "فن",
  "Photography": "تصوير",
  "3D": "ثلاثي الأبعاد",
  "Animation": "رسوم متحركة",
  "Presentation": "عروض تقديمية",
  "Spreadsheet": "جداول بيانات",
  "Database": "قواعد بيانات",
  "Developer Tools": "أدوات المطورين",
  "No-Code": "بدون كود",
  "Low-Code": "كود منخفض",
  "API": "واجهة برمجة",
  "Security": "أمان",
  "Testing": "اختبار",
  "Analytics": "تحليلات",
  "Project Management": "إدارة مشاريع",
  "Collaboration": "تعاون",
  "Communication": "تواصل",
  "File Management": "إدارة ملفات",
  "Search": "بحث",
  "Browser Extension": "إضافات المتصفح",
  "Mobile App": "تطبيق جوال",
  "Desktop App": "تطبيق سطح المكتب",
  "Plugin": "إضافة",
  "Integration": "تكامل",
  "Workflow": "سير عمل",
  "Scheduling": "جدولة",
  "Note Taking": "تدوين ملاحظات",
  "Mind Mapping": "خرائط ذهنية",
  "CRM": "إدارة علاقات العملاء",
  "E-commerce": "تجارة إلكترونية",
  "Real Estate": "عقارات",
  "Travel": "سفر",
  "Food": "طعام",
  "Fashion": "أزياء",
  "Fitness": "لياقة",
  "Lifestyle": "نمط حياة",
  "News": "أخبار",
  "Entertainment": "ترفيه",
  "Utilities": "أدوات مساعدة",
  "Other": "أخرى",
};

const pricingLabels: Record<string, string> = {
  // Arabic
  "مجاني": "مجاني",
  "مجاني بالكامل": "مجاني بالكامل",
  "مدفوع": "مدفوع",
  "تجربة مجانية": "تجربة مجانية",
  "مجاني / مدفوع": "مجاني / مدفوع",
  // English from DB
  "Free": "مجاني",
  "Freemium": "مجاني / مدفوع",
  "Paid": "مدفوع",
  "Free Trial": "تجربة مجانية",
  "Open Source": "مفتوح المصدر",
  "Contact for Pricing": "تواصل للسعر",
  "free": "مجاني",
  "freemium": "مجاني / مدفوع",
  "paid": "مدفوع",
};

export type PricingTier = "free" | "freemium" | "paid" | "trial" | "unknown";

export const getCategoryLabel = (category: string | undefined | null): string => {
  if (!category) return "غير محدد";
  return categoryLabels[category] ?? category;
};

export const getPricingLabel = (pricing: string | undefined | null): string => {
  if (!pricing) return "غير محدد";
  return pricingLabels[pricing] ?? pricing;
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
