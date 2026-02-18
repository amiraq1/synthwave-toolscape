import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useEffect } from "react";

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  useEffect(() => {
    document.dir = isAr ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [isAr, i18n.language]);

  const toggleLang = () => {
    i18n.changeLanguage(isAr ? "en" : "ar");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLang}
      className="gap-2 font-bold"
      aria-label={isAr ? "تغيير اللغة" : "Change language"}
      title={isAr ? "تغيير اللغة" : "Change language"}
    >
      <Languages className="w-4 h-4" />
      {isAr ? "EN" : "عربي"}
    </Button>
  );
};

export default LanguageToggle;
