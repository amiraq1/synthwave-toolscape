import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.resolve(__dirname, "../public/data/tools.json");
const requestedCount = Number.parseInt(process.argv[2] || "10000", 10);
const additionalCount = Number.isFinite(requestedCount) && requestedCount > 0 ? requestedCount : 10000;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomDateInLastYears = (years = 2) => {
  const now = Date.now();
  const span = years * 365 * 24 * 60 * 60 * 1000;
  return new Date(now - Math.floor(Math.random() * span)).toISOString();
};

const useCasesByCategory = {
  text: ["كتابة المحتوى", "إعادة الصياغة", "التلخيص", "تحسين SEO", "المراسلات"],
  image: ["تصميم الصور", "تحرير الصور", "توليد الشعارات", "إنشاء هوية بصرية", "تحسين الدقة"],
  video: ["تحرير الفيديو", "إنشاء فيديو قصير", "إضافة ترجمة", "تحويل النص إلى فيديو", "تحسين المونتاج"],
  code: ["توليد الكود", "مراجعة الكود", "تصحيح الأخطاء", "بناء API", "أتمتة التطوير"],
  productivity: ["إدارة المهام", "كتابة التقارير", "أتمتة سير العمل", "إدارة المشاريع", "تنظيم المعرفة"],
  study: ["البحث العلمي", "تلخيص الأوراق", "إنشاء مذكرات", "شرح المفاهيم", "تحليل PDF"],
  audio: ["تحويل النص إلى صوت", "تنقية الصوت", "نسخ الصوت", "إنشاء بودكاست", "إنتاج موسيقى"]
};

const featuresByCategory = {
  text: ["كتابة ذكية", "تلخيص سريع", "دعم عربي", "تحسين أسلوب", "قوالب جاهزة"],
  image: ["توليد صور", "رفع الجودة", "إزالة الخلفية", "تحرير سريع", "أنماط فنية"],
  video: ["تحويل نص إلى فيديو", "ترجمة تلقائية", "مؤثرات ذكية", "تحرير زمني", "إخراج HD"],
  code: ["إكمال كود", "فحص أخطاء", "شرح كود", "اقتراح حلول", "دعم متعدد اللغات"],
  productivity: ["إدارة أعمال", "تقارير تلقائية", "تذكيرات ذكية", "لوحات متابعة", "تكاملات"],
  study: ["تحليل مستندات", "تلخيص أكاديمي", "استشهادات", "خرائط ذهنية", "اختبارات قصيرة"],
  audio: ["استنساخ صوت", "تنقية ضوضاء", "تحويل صوت لنص", "أصوات متعددة", "مكساج ذكي"]
};

const toCategoryKey = (categoryValue = "") => {
  const c = String(categoryValue).toLowerCase();
  if (c.includes("برمج") || c.includes("coding") || c.includes("development")) return "code";
  if (c.includes("فيديو") || c.includes("video")) return "video";
  if (c.includes("صوت") || c.includes("audio") || c.includes("music")) return "audio";
  if (c.includes("صور") || c.includes("تصميم") || c.includes("image") || c.includes("design")) return "image";
  if (c.includes("تعليم") || c.includes("دراسة") || c.includes("طلاب") || c.includes("study") || c.includes("research")) return "study";
  if (c.includes("إنتاجية") || c.includes("productivity")) return "productivity";
  return "text";
};

const main = () => {
  if (!fs.existsSync(filePath)) {
    console.error(`tools.json not found at: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const existing = JSON.parse(raw);

  if (!Array.isArray(existing)) {
    console.error("Invalid tools.json format. Expected an array.");
    process.exit(1);
  }

  const numericIds = existing
    .map((tool) => Number.parseInt(String(tool.id), 10))
    .filter((id) => Number.isFinite(id));

  const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
  const categories = [...new Set(existing.map((tool) => tool.category).filter(Boolean))];
  const pricingTypes = [...new Set(existing.map((tool) => tool.pricing_type).filter(Boolean))];

  const fallbackCategories = ["نصوص", "صور", "فيديو", "برمجة", "إنتاجية", "دراسة وطلاب", "صوت"];
  const finalCategories = categories.length > 0 ? categories : fallbackCategories;
  const finalPricing = pricingTypes.length > 0 ? pricingTypes : ["مجاني", "Freemium", "مدفوع"];

  const existingUrls = new Set(existing.map((tool) => String(tool.url || "").toLowerCase().trim()));
  const generated = [];

  for (let i = 1; i <= additionalCount; i += 1) {
    const id = maxId + i;
    const category = pick(finalCategories);
    const categoryKey = toCategoryKey(category);
    const useCase = pick(useCasesByCategory[categoryKey]);
    const featurePool = featuresByCategory[categoryKey];

    let url = `https://toolscape.ai/tool/${id}`;
    while (existingUrls.has(url)) {
      url = `https://toolscape.ai/tool/${id}-${Math.floor(Math.random() * 10000)}`;
    }
    existingUrls.add(url);

    const features = [...featurePool].sort(() => 0.5 - Math.random()).slice(0, 3);
    const rating = Number((3.7 + Math.random() * 1.3).toFixed(1));

    generated.push({
      id: String(id),
      title: `Toolscape AI ${id}`,
      title_en: `Toolscape AI ${id}`,
      description: `أداة ذكاء اصطناعي متخصصة في ${useCase} مع واجهة سهلة وسرعة عالية.`,
      description_en: `An AI tool focused on ${useCase} with a fast workflow and easy interface.`,
      category,
      url,
      image_url: "",
      pricing_type: pick(finalPricing),
      is_featured: i % 250 === 0,
      is_published: true,
      created_at: randomDateInLastYears(2),
      features,
      screenshots: [],
      is_sponsored: false,
      supports_arabic: Math.random() < 0.6,
      average_rating: rating,
      reviews_count: Math.floor(Math.random() * 900)
    });
  }

  const nextData = [...existing, ...generated];
  fs.writeFileSync(filePath, `${JSON.stringify(nextData, null, 2)}\n`, "utf8");

  console.log(`Added ${generated.length} tools.`);
  console.log(`Total tools in file: ${nextData.length}`);
  console.log(`Updated file: ${filePath}`);
};

main();
