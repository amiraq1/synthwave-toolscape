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
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        lng: "ar", // اللغة الافتراضية
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
