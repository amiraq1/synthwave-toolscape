import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useEffect } from "react";

const LanguageToggle = () => {
    const { i18n } = useTranslation();

    // تغيير اتجاه الصفحة عند تغيير اللغة
    useEffect(() => {
        document.dir = i18n.language === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = i18n.language;
    }, [i18n.language]);

    const toggleLang = () => {
        const newLang = i18n.language === "ar" ? "en" : "ar";
        i18n.changeLanguage(newLang);
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLang}
            className="gap-2 font-bold"
        >
            <Languages className="w-4 h-4" />
            {i18n.language === "ar" ? "EN" : "عربي"}
        </Button>
    );
};

export default LanguageToggle;
