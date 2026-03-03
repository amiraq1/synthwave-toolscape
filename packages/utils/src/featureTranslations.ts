/**
 * قاموس ترجمة المصطلحات التقنية الشائعة من الإنجليزية إلى العربية
 * يُستخدم لترجمة مميزات الأدوات (features) المخزنة بالإنجليزية في قاعدة البيانات
 */
const featureTranslations: Record<string, string> = {
    // — البرمجة والتطوير —
    "code editor": "محرر أكواد",
    "code generation": "توليد الأكواد",
    "code completion": "إكمال الأكواد",
    "code review": "مراجعة الأكواد",
    "code refactoring": "إعادة هيكلة الأكواد",
    "refactoring": "إعادة الهيكلة",
    "debugging": "تصحيح الأخطاء",
    "copilot": "مساعد برمجي ذكي",
    "autocomplete": "إكمال تلقائي",
    "syntax highlighting": "تمييز الصياغة",
    "version control": "التحكم بالإصدارات",
    "git integration": "تكامل مع Git",
    "api": "واجهة برمجية (API)",
    "api integration": "تكامل الواجهات البرمجية",
    "sdk": "حزمة تطوير (SDK)",
    "cli": "واجهة سطر الأوامر",
    "open source": "مفتوح المصدر",
    "plugin": "إضافة",
    "plugins": "إضافات",
    "extensions": "إضافات",

    // — واجهات المستخدم —
    "ui generation": "توليد واجهات المستخدم",
    "ui design": "تصميم واجهات المستخدم",
    "ui/ux": "تصميم واجهات وتجربة المستخدم",
    "ux design": "تصميم تجربة المستخدم",
    "responsive design": "تصميم متجاوب",
    "dark mode": "الوضع الداكن",
    "drag and drop": "سحب وإفلات",
    "drag & drop": "سحب وإفلات",
    "templates": "قوالب جاهزة",
    "template": "قالب جاهز",
    "wireframing": "تخطيط أولي",
    "prototyping": "نمذجة أولية",
    "figma": "Figma",
    "components": "مكونات",
    "component library": "مكتبة مكونات",

    // — الأُطر والتقنيات —
    "react": "React",
    "next.js": "Next.js",
    "vue": "Vue",
    "angular": "Angular",
    "tailwind": "Tailwind CSS",
    "tailwindcss": "Tailwind CSS",
    "typescript": "TypeScript",
    "javascript": "JavaScript",
    "python": "Python",
    "node.js": "Node.js",
    "html": "HTML",
    "css": "CSS",
    "shadcn ui": "Shadcn UI",

    // — الذكاء الاصطناعي —
    "ai": "ذكاء اصطناعي",
    "ai-powered": "مدعوم بالذكاء الاصطناعي",
    "ai powered": "مدعوم بالذكاء الاصطناعي",
    "artificial intelligence": "ذكاء اصطناعي",
    "machine learning": "تعلم آلي",
    "deep learning": "تعلم عميق",
    "natural language processing": "معالجة اللغة الطبيعية",
    "nlp": "معالجة اللغة الطبيعية",
    "chatbot": "روبوت محادثة",
    "chat": "محادثة",
    "conversational ai": "ذكاء اصطناعي محادثي",
    "text generation": "توليد النصوص",
    "text to speech": "تحويل النص لكلام",
    "speech to text": "تحويل الكلام لنص",
    "text-to-speech": "تحويل النص لكلام",
    "speech-to-text": "تحويل الكلام لنص",
    "voice recognition": "التعرف على الصوت",
    "sentiment analysis": "تحليل المشاعر",
    "image generation": "توليد الصور",
    "image editing": "تحرير الصور",
    "image recognition": "التعرف على الصور",
    "video generation": "توليد الفيديو",
    "video editing": "تحرير الفيديو",
    "text to image": "تحويل النص لصورة",
    "text-to-image": "تحويل النص لصورة",
    "text to video": "تحويل النص لفيديو",
    "text-to-video": "تحويل النص لفيديو",
    "object detection": "اكتشاف الكائنات",
    "computer vision": "رؤية حاسوبية",
    "generative ai": "ذكاء اصطناعي توليدي",
    "large language model": "نموذج لغوي كبير",
    "llm": "نموذج لغوي كبير",
    "gpt": "GPT",
    "fine-tuning": "ضبط دقيق",
    "training": "تدريب",
    "model training": "تدريب النموذج",
    "prompt engineering": "هندسة الأوامر",

    // — المحتوى والكتابة —
    "content generation": "إنشاء المحتوى",
    "content creation": "إنشاء المحتوى",
    "content writing": "كتابة المحتوى",
    "copywriting": "كتابة إعلانية",
    "blog writing": "كتابة المدونات",
    "article writing": "كتابة المقالات",
    "seo": "تحسين محركات البحث",
    "seo optimization": "تحسين محركات البحث",
    "keyword research": "بحث الكلمات المفتاحية",
    "grammar check": "فحص القواعد",
    "grammar correction": "تصحيح القواعد",
    "spell check": "تدقيق إملائي",
    "paraphrasing": "إعادة الصياغة",
    "summarization": "تلخيص",
    "translation": "ترجمة",
    "multilingual": "متعدد اللغات",
    "writing assistant": "مساعد كتابة",
    "plagiarism detection": "كشف الانتحال",
    "plagiarism checker": "فاحص الانتحال",

    // — البيانات والتحليلات —
    "data analysis": "تحليل البيانات",
    "data visualization": "تصور البيانات",
    "analytics": "تحليلات",
    "dashboard": "لوحة تحكم",
    "reporting": "إعداد التقارير",
    "reports": "تقارير",
    "spreadsheet": "جداول بيانات",
    "database": "قاعدة بيانات",
    "real-time": "في الوقت الحقيقي",
    "real time": "في الوقت الحقيقي",

    // — الأعمال والإنتاجية —
    "automation": "أتمتة",
    "workflow automation": "أتمتة سير العمل",
    "workflow": "سير العمل",
    "task management": "إدارة المهام",
    "project management": "إدارة المشاريع",
    "collaboration": "تعاون جماعي",
    "team collaboration": "تعاون الفريق",
    "productivity": "إنتاجية",
    "scheduling": "جدولة",
    "calendar": "تقويم",
    "email": "بريد إلكتروني",
    "email marketing": "التسويق بالبريد الإلكتروني",
    "crm": "إدارة علاقات العملاء",
    "customer support": "دعم العملاء",
    "customer service": "خدمة العملاء",
    "sales": "مبيعات",
    "marketing": "تسويق",
    "social media": "وسائل التواصل الاجتماعي",
    "social media management": "إدارة وسائل التواصل",
    "lead generation": "توليد العملاء المحتملين",
    "e-commerce": "تجارة إلكترونية",
    "ecommerce": "تجارة إلكترونية",
    "invoicing": "إصدار الفواتير",
    "accounting": "محاسبة",
    "hr": "موارد بشرية",
    "recruitment": "توظيف",
    "onboarding": "إعداد الموظفين الجدد",

    // — التصميم والوسائط —
    "graphic design": "تصميم جرافيكي",
    "logo design": "تصميم الشعارات",
    "photo editing": "تحرير الصور",
    "background removal": "إزالة الخلفية",
    "upscaling": "تحسين الدقة",
    "animation": "رسوم متحركة",
    "3d modeling": "نمذجة ثلاثية الأبعاد",
    "3d": "ثلاثي الأبعاد",
    "rendering": "تصيير",
    "color palette": "لوحة الألوان",
    "mockup": "نموذج بصري",
    "brand kit": "هوية بصرية",
    "branding": "بناء العلامة التجارية",

    // — الصوت والموسيقى —
    "audio editing": "تحرير الصوت",
    "music generation": "توليد الموسيقى",
    "voice cloning": "استنساخ الصوت",
    "transcription": "تفريغ صوتي",
    "podcast": "بودكاست",
    "noise removal": "إزالة الضوضاء",
    "voice over": "تعليق صوتي",

    // — الأمن والخصوصية —
    "security": "أمان",
    "encryption": "تشفير",
    "authentication": "مصادقة",
    "privacy": "خصوصية",
    "data protection": "حماية البيانات",
    "compliance": "امتثال",
    "two-factor authentication": "مصادقة ثنائية",
    "2fa": "مصادقة ثنائية",

    // — السحابة —
    "cloud": "سحابي",
    "cloud-based": "قائم على السحابة",
    "cloud storage": "تخزين سحابي",
    "hosting": "استضافة",
    "deployment": "نشر",
    "scalable": "قابل للتوسع",
    "saas": "خدمة سحابية (SaaS)",

    // — عام —
    "free": "مجاني",
    "freemium": "مجاني مع خطط مدفوعة",
    "premium": "مميز",
    "no signup required": "بدون تسجيل",
    "no credit card": "بدون بطاقة ائتمان",
    "free trial": "تجربة مجانية",
    "cross-platform": "متعدد المنصات",
    "cross platform": "متعدد المنصات",
    "mobile app": "تطبيق جوال",
    "desktop app": "تطبيق سطح المكتب",
    "browser extension": "إضافة متصفح",
    "chrome extension": "إضافة كروم",
    "offline": "بدون إنترنت",
    "integration": "تكامل",
    "integrations": "تكاملات",
    "custom": "مخصص",
    "customizable": "قابل للتخصيص",
    "export": "تصدير",
    "import": "استيراد",
    "batch processing": "معالجة دفعية",
    "file conversion": "تحويل الملفات",
    "pdf": "PDF",
    "no-code": "بدون برمجة",
    "low-code": "برمجة منخفضة",
    "no code": "بدون برمجة",
    "low code": "برمجة منخفضة",
    "search": "بحث",
    "advanced search": "بحث متقدم",
    "notifications": "إشعارات",
    "sharing": "مشاركة",
    "multi-user": "متعدد المستخدمين",
    "white label": "تخصيص العلامة التجارية",
    "webhook": "ربط أحداث (Webhook)",
    "webhooks": "ربط أحداث (Webhooks)",
};

/**
 * ترجمة ميزة واحدة من الإنجليزية إلى العربية
 * يبحث أولاً عن مطابقة كاملة، ثم مطابقة جزئية
 */
export function translateFeature(feature: string): string {
    const lower = feature.toLowerCase().trim();

    // مطابقة كاملة
    if (featureTranslations[lower]) {
        return featureTranslations[lower];
    }

    // إذا كان النص يحتوي على حروف عربية، أعده كما هو
    if (/[\u0600-\u06FF]/.test(feature)) {
        return feature;
    }

    // مطابقة جزئية: حاول ترجمة كلمة كلمة إذا كانت العبارة غير موجودة
    const words = lower.split(/\s+/);
    if (words.length > 1) {
        // حاول إيجاد أطول عبارة فرعية لها ترجمة
        for (let len = words.length; len >= 2; len--) {
            for (let start = 0; start <= words.length - len; start++) {
                const phrase = words.slice(start, start + len).join(' ');
                if (featureTranslations[phrase]) {
                    // وجدت ترجمة لجزء = ارجع النص الأصلي (لتجنب ترجمة مشوهة)
                    return featureTranslations[phrase];
                }
            }
        }
    }

    // لم توجد ترجمة — أعد النص الأصلي مع تنسيقه بحرف أول كبير
    return feature.charAt(0).toUpperCase() + feature.slice(1);
}

/**
 * ترجمة مصفوفة من المميزات
 */
export function translateFeatures(features: string[]): string[] {
    return features.map(translateFeature);
}
