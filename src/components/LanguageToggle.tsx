import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import "dayjs/locale/en";

const LanguageToggle = () => {
    const { i18n } = useTranslation();
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // يتم تطبيق التغييرات على الفور عند التحميل المبدئي
        const root = document.documentElement;
        root.dir = i18n.language === "ar" ? "rtl" : "ltr";
        root.lang = i18n.language;
        dayjs.locale(i18n.language === "ar" ? "ar" : "en");
    }, [i18n.language]);

    const toggleLang = () => {
        if (isAnimating) return;
        setIsAnimating(true);

        // تأثير سينمائي طليعي: إخفاء محتوى التطبيق بسلاسة لتجنب القفزات البصرية (Layout Thrashing)
        const appRoot = document.getElementById("root");
        if (appRoot) {
            appRoot.style.transition = "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), filter 0.3s ease";
            appRoot.style.opacity = "0";
            appRoot.style.filter = "blur(4px)";
        }

        // الانتظار حتى يكتمل الاختفاء
        setTimeout(() => {
            const newLang = i18n.language === "ar" ? "en" : "ar";
            i18n.changeLanguage(newLang); // تبديل اللغة، سيؤدي لدورة تحديث (Re-render)

            // إعطاء المتصفح فرصة لرسم الواجهة بالاتجاه الجديد واللغة الجديدة
            requestAnimationFrame(() => {
                if (appRoot) {
                    appRoot.style.opacity = "1";
                    appRoot.style.filter = "blur(0)";
                }

                // تحرير قفل الأنيميشن بعد ظهور الواجهة
                setTimeout(() => setIsAnimating(false), 300);
            });
        }, 300);
    };

    return (
        <button
            onClick={toggleLang}
            disabled={isAnimating}
            className="group relative flex items-center justify-center gap-2 px-4 py-2 min-w-[76px] overflow-hidden rounded-full border border-white/10 bg-black/20 text-sm font-bold text-slate-300 backdrop-blur-md transition-all duration-500 hover:border-neon-purple/50 hover:bg-neon-purple/10 hover:text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:cursor-[wait] disabled:opacity-80"
            aria-label="Change language"
            title={i18n.language === "ar" ? "Switch to English" : "التبديل للعربية"}
        >
            {/* لمعة ديناميكية تتحرك عند تفاعل المستخدم أو أثناء التبديل */}
            <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] transition-transform duration-700 ${isAnimating ? "translate-x-[100%]" : "group-hover:translate-x-[100%]"}`} />

            {/* أيقونة اللغات مع حركة دائرية ناعمة */}
            <Languages className={`w-4 h-4 transition-transform duration-500 ${isAnimating ? "rotate-180 scale-75 text-neon-purple" : "rotate-0 scale-100"}`} />

            {/* النص الذي يوضح اللغة الأخرى */}
            <span className={`relative flex min-w-[20px] justify-center text-xs tracking-widest uppercase transition-all duration-300 ${isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
                {i18n.language === "ar" ? "EN" : "AR"}
            </span>
        </button>
    );
};

export default LanguageToggle;
