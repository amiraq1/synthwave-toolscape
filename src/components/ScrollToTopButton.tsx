import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    // مراقبة التمرير لإظهار/إخفاء الزر
    useEffect(() => {
        const toggleVisibility = () => {
            // يظهر الزر إذا نزل المستخدم أكثر من 300 بكسل
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    // دالة الصعود للأعلى
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth", // حركة ناعمة
        });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="العودة لأعلى الصفحة"
            className={`
        fixed bottom-8 left-4 z-50 
        inline-flex h-10 w-10 items-center justify-center rounded-full p-0 
        shadow-lg ring-offset-background transition-all duration-300 
        border border-white/10 backdrop-blur-sm
        bg-neon-purple/80 hover:bg-neon-purple text-white
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        ${isVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-10 pointer-events-none"}
      `}
        >
            <ArrowUp className="h-5 w-5" />
        </button>
    );
}
