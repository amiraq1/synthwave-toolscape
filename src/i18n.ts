import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

i18n
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
        lng: "ar",
        fallbackLng: "ar",
        supportedLngs: ["ar", "en"],
        backend: {
            loadPath: "/locales/{{lng}}.json",
        },
        interpolation: {
            escapeValue: false
        },
        // عدم عرض مفاتيح الترجمة أثناء التحميل
        react: {
            useSuspense: false,
        },
    });

export default i18n;
