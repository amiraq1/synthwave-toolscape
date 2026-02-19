import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname
      );
    }
  }, [location.pathname]);

  return (
    <div
      className="flex min-h-[80vh] items-center justify-center px-4"
      dir={isAr ? "rtl" : "ltr"}
      role="main"
    >
      {/* Background Orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[40vw] h-[40vw] bg-neon-purple/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative z-10 text-center space-y-6 max-w-md mx-auto">
        {/* Glitch-style 404 */}
        <div className="relative">
          <span className="text-[10rem] md:text-[12rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 select-none">
            404
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-[10rem] md:text-[12rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-blue animate-pulse-slow select-none">
            404
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white -mt-8">
          {isAr ? "الصفحة غير موجودة" : "Page Not Found"}
        </h1>

        <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
          {isAr
            ? "هذا الرابط غير متاح أو تم نقله. يمكنك الرجوع واستكشاف أدوات الذكاء الاصطناعي من الصفحة الرئيسية."
            : "This link is unavailable or has moved. You can head back and explore AI tools from the homepage."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            asChild
            className="bg-neon-purple hover:bg-neon-purple/90 text-white gap-2 px-6 h-12 rounded-xl shadow-lg shadow-neon-purple/20"
          >
            <Link to="/">
              <Home className="w-4 h-4" />
              {isAr ? "العودة للرئيسية" : "Back to Home"}
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-white/10 hover:border-neon-purple/50 hover:text-neon-purple gap-2 h-12 rounded-xl"
          >
            <Link to="/blog">
              {isAr ? "تصفح المدونة" : "Browse Blog"}
              <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
