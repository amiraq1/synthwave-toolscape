import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
    ar: {
        translation: {
            "nav.home": "الرئيسية",
            "nav.tools": "الأدوات",
            "nav.blog": "المدونة",
            "nav.login": "دخول",
            "hero.title": "دليلك الذكي لعالم الذكاء الاصطناعي",
            "hero.subtitle": "اكتشف أفضل الأدوات التي تناسب احتياجاتك ببحث ذكي ودقيق.",
            "search.placeholder": "عن ماذا تبحث؟ (مثال: مونتاج فيديو)",
            "tools.visit": "زيارة الموقع",
            "tools.details": "التفاصيل",
            "footer.rights": "جميع الحقوق محفوظة © 2026 نبض AI",
            "filters.all": "الكل",
            "filters.developer": "مبرمج",
            "filters.designer": "مصمم",
            "section.new_tools": "أحدث الأدوات",
            "footer.about": "نبض AI هو منصتك الأولى لاكتشاف أدوات المستقبل.",
            "footer.links": "روابط هامة",
            "profile.title": "ملفي الشخصي",
            "profile.library": "مكتبتي (المفضلة)",
            "profile.reviews": "مراجعاتي",
            "profile.settings": "الإعدادات",
            "profile.save": "حفظ التغييرات",
            "profile.logout": "تسجيل الخروج",
            "profile.no_bookmarks": "لم تقم بحفظ أي أدوات بعد.",
            "tool.visit": "زيارة الموقع الرسمي",
            "tool.features": "المميزات الرئيسية",
            "tool.similar": "أدوات مشابهة قد تعجبك",
            "tool.share": "مشاركة الصفحة",
            "compare.title": "مقارنة الأدوات",
            "compare.empty": "لم تختر أي أدوات للمقارنة",
            "compare.add": "إضافة للمقارنة",
            "common.loading": "جاري التحميل...",
            "common.error": "حدث خطأ ما",
            "common.read_more": "قراءة المزيد",
        }
    },
    en: {
        translation: {
            "nav.home": "Home",
            "nav.tools": "Tools",
            "nav.blog": "Blog",
            "nav.login": "Login",
            "hero.title": "Your Smart Guide to the AI World",
            "hero.subtitle": "Discover the best tools for your needs with intelligent semantic search.",
            "search.placeholder": "What are you looking for? (e.g. Video Editing)",
            "tools.visit": "Visit Site",
            "tools.details": "Details",
            "footer.rights": "All rights reserved © 2026 Nabd AI",
            "filters.all": "All",
            "filters.developer": "Developer",
            "filters.designer": "Designer",
            "section.new_tools": "Newest Tools",
            "footer.about": "Nabd AI is your #1 platform to discover future tools.",
            "footer.links": "Important Links",
            "profile.title": "Profile",
            "profile.library": "My Library (Bookmarks)",
            "profile.reviews": "My Reviews",
            "profile.settings": "Settings",
            "profile.save": "Save Changes",
            "profile.logout": "Logout",
            "profile.no_bookmarks": "You have not bookmarked any tools yet.",
            "tool.visit": "Visit Official Website",
            "tool.features": "Key Features",
            "tool.similar": "Similar Tools You Might Like",
            "tool.share": "Share Page",
            "compare.title": "Tool Comparison",
            "compare.empty": "No tools selected for comparison",
            "compare.add": "Add to Compare",
            "common.loading": "Loading...",
            "common.error": "Something went wrong",
            "common.read_more": "Read More",
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "ar",
        supportedLngs: ["ar", "en"],
        detection: {
            order: ["localStorage"],
            caches: ["localStorage"],
        },
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
