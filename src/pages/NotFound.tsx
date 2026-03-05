import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error('404 Error: User attempted to access non-existent route:', location.pathname);
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="text-8xl font-extrabold animated-gradient-text">404</div>
        <h1 className="text-2xl font-bold text-foreground">{t("notfound.title")}</h1>
        <p className="text-muted-foreground max-w-md mx-auto">{t("notfound.description")}</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20 font-medium transition-all group"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
          <span className="font-arabic">{t("notfound.back")}</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
