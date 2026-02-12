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

// --- DATA LISTS FOR GENERATION ---

const prefixes = ["Super", "Ultra", "Hyper", "Mega", "Giga", "Pro", "Smart", "Auto", "Quick", "Easy", "Master", "Genius", "Future", "Tech", "Cyber", "Nova", "Apex", "Prime", "Elite", "Core"];
const nouns = ["Write", "Pixel", "Code", "Chat", "Bot", "Gen", "Draft", "Flow", "Task", "Mind", "Learn", "Speak", "Voice", "Vision", "Data", "Graph", "Note", "Edit", "Clip", "Sound"];
const suffixes = ["AI", "Pro", "Labs", "IO", "App", "Hub", "Box", "Mate", "Pilot", "Engine", "Works", "Studio", "Kit", "Sync", "Stream", "Fusion", "Spark", "Pulse", "Wave", "Sphere"];

const categories = {
  text: {
    names: ["Writer", "Copy", "Script", "Text", "Word", "Content", "Blog", "Essay"],
    useCases: ["كتابة المحتوى التسويقي", "تلخيص المقالات الطويلة", "تحسين محركات البحث SEO", "إعادة صياغة النصوص", "كتابة البريد الإلكتروني", "تأليف القصص"],
    features: ["تدقيق لغوي", "اقتراحات ذكية", "قوالب جاهزة", "نبرات متعددة", "توليد عناوين"]
  },
  image: {
    names: ["Image", "Art", "Pic", "Photo", "Canvas", "Draw", "Sketch", "Design"],
    useCases: ["توليد الصور من النص", "تحسين جودة الصور", "إزالة الخلفيات", "تصميم الشعارات", "تعديل الصور الشخصية", "إنشاء تصاميم السوشيال ميديا"],
    features: ["دقة عالية 4K", "فلاتر فنية", "تحرير سريع", "تصدير متعدد الصيغ", "أنماط متنوعة"]
  },
  video: {
    names: ["Video", "Clip", "Film", "Motion", "Reel", "Stream", "Studio", "Cut"],
    useCases: ["مونتاج الفيديو الآلي", "إضافة ترجمات تلقائية", "تحويل النص إلى فيديو", "إنشاء مقاطع قصيرة (Shoorts)", "تحسين إضاءة الفيديو"],
    features: ["تصدير سريع", "مكتبة مؤثرات", "دعم 4K", "مزامنة صوتية", "قوالب جاهزة"]
  },
  code: {
    names: ["Code", "Dev", "Git", "Stack", "Script", "Terminal", "Debug", "API"],
    useCases: ["إنشاء أكواد برمجية", "شرح الأكواد المعقدة", "اكتشاف الأخطاء وإصلاحها", "تحويل التصميم لكود", "أتمتة الاختبارات البرمجية"],
    features: ["دعم لغات متعددة", "تكامل مع VS Code", "شرح تفصيلي", "توليد اختبارات", "دعم API"]
  },
  productivity: {
    names: ["Task", "Plan", "Organize", "Focus", "Team", "Work", "Flow", "Done"],
    useCases: ["إدارة المشاريع", "تنظيم المهام اليومية", "أتمتة سير العمل", "تلخيص الاجتماعات", "إدارة البريد الوارد"],
    features: ["لوحة تحكم", "تنبيهات ذكية", "تقارير أداء", "ربط مع أدوات أخرى", "وضع التركيز"]
  },
  study: {
    names: ["Study", "Learn", "Exam", "Scholar", "Research", "Paper", "Uni", "Grade"],
    useCases: ["تلخيص الأبحاث العلمية", "شرح المفاهيم الصعبة", "إنشاء اختبارات مراجعة", "المساعدة في كتابة الرسائل", "حل المسائل الرياضية"],
    features: ["مصارد موثوقة", "شرح مبسط", "فلاش كاردز", "خرائط ذهنية", "اقتباس مصادر"]
  },
  audio: {
    names: ["Audio", "Sound", "Voice", "Music", "Tune", "Beat", "Pod", "Cast"],
    useCases: ["تحويل النص إلى كلام", "استنساخ الأصوات", "عزل الضوضاء", "توليد موسيقى خلفية", "تفريغ الملفات الصوتية"],
    features: ["أصوات طبيعية", "دعم لهجات", "مؤثرات صوتية", "تصدير MP3/WAV", "تحرير موجات"]
  }
};

const toCategoryKey = (categoryValue = "") => {
  const c = String(categoryValue).toLowerCase();
  if (c.includes("برمج") || c.includes("coding") || c.includes("dev")) return "code";
  if (c.includes("فيديو") || c.includes("video")) return "video";
  if (c.includes("صوت") || c.includes("audio") || c.includes("music")) return "audio";
  if (c.includes("صور") || c.includes("تصميم") || c.includes("image") || c.includes("design")) return "image";
  if (c.includes("تعليم") || c.includes("دراسة") || c.includes("study") || c.includes("research")) return "study";
  if (c.includes("إنتاجية") || c.includes("prod")) return "productivity";
  return "text";
};

const main = () => {
  if (!fs.existsSync(filePath)) {
    console.error(`tools.json not found at: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const existing = JSON.parse(raw);

  const numericIds = existing
    .map((tool) => Number.parseInt(String(tool.id), 10))
    .filter((id) => Number.isFinite(id));

  const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;

  // Weights for categories to ensure distribution
  const fallbackCategories = ["نصوص", "صور", "فيديو", "برمجة", "إنتاجية", "دراسة وطلاب", "صوت"];

  const generated = [];
  const existingUrls = new Set(existing.map((tool) => String(tool.url || "").toLowerCase().trim()));

  console.log(`🚀 Generating ${additionalCount} diverse tools...`);

  for (let i = 1; i <= additionalCount; i += 1) {
    const id = maxId + i;
    const categoryName = pick(fallbackCategories);
    const catKey = toCategoryKey(categoryName);
    const catData = categories[catKey];

    // Generate Name: [Prefix] [Noun] [Suffix] OR [Noun][Suffix]
    let nameEn = "";
    if (Math.random() > 0.5) {
      nameEn = `${pick(prefixes)} ${pick(catData.names)} ${pick(suffixes)}`;
    } else {
      nameEn = `${pick(catData.names)}${pick(suffixes)}`;
    }

    // Ensure uniqueness roughly
    nameEn = `${nameEn} ${Math.floor(Math.random() * 99)}`;

    const useCase = pick(catData.useCases);
    const description = `أداة ذكاء اصطناعي متطورة متخصصة في ${useCase}، تساعدك على إنجاز مهامك بسرعة ودقة عالية.`;
    const descriptionEn = `Advanced AI tool specialized in ${catKey} related tasks, helping you achieve more in less time with ${pick(catData.features)}.`;

    // Generate URL
    let slug = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    let url = `https://${slug}.com`;

    // Avoid dupes
    while (existingUrls.has(url)) {
      url = `https://${slug}-${Math.floor(Math.random() * 1000)}.com`;
    }
    existingUrls.add(url);

    const toolFeatures = [];
    while (toolFeatures.length < 3) {
      const f = pick(catData.features);
      if (!toolFeatures.includes(f)) toolFeatures.push(f);
    }

    const rating = Number((3.5 + Math.random() * 1.5).toFixed(1)); // 3.5 to 5.0

    generated.push({
      id: String(id),
      title: nameEn,
      title_en: nameEn,
      description: description,
      description_en: descriptionEn,
      category: categoryName,
      url: url,
      image_url: "",
      pricing_type: pick(["مجاني", "Freemium", "مدفوع", "تجربة مجانية"]),
      is_featured: Math.random() < 0.05, // 5% chance
      is_published: true,
      created_at: randomDateInLastYears(2),
      features: toolFeatures,
      screenshots: [],
      is_sponsored: Math.random() < 0.02,
      supports_arabic: Math.random() > 0.4,
      average_rating: rating,
      reviews_count: Math.floor(Math.random() * 500)
    });
  }

  const nextData = [...existing, ...generated];
  fs.writeFileSync(filePath, JSON.stringify(nextData, null, 2), "utf8");

  console.log(`✅ Added ${generated.length} tools successfully.`);
  console.log(`📊 Total tools in file: ${nextData.length}`);
};

main();
