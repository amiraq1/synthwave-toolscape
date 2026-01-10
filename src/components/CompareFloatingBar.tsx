import { useCompare } from "@/context/CompareContext";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, Scale } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const CompareFloatingBar = () => {
    const { selectedTools, clearCompare } = useCompare();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(false);

    // إخفاء الشريط إذا كنا في صفحة المقارنة نفسها أو القائمة فارغة
    useEffect(() => {
        if (selectedTools.length > 0 && location.pathname !== "/compare") {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [selectedTools, location.pathname]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="bg-[#1a1a2e]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4 ring-1 ring-white/5">

                {/* معلومات العدد */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center border border-neon-purple/50">
                            <Scale className="w-5 h-5 text-neon-purple" />
                        </div>
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#1a1a2e]">
                            {selectedTools.length}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">المقارنة نشطة</span>
                        <span className="text-xs text-gray-400">
                            {selectedTools.length === 1 ? "اختر أداة أخرى للمقارنة" : `${selectedTools.length} أدوات محددة`}
                        </span>
                    </div>
                </div>

                {/* الأزرار */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearCompare}
                        className="text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                        aria-label="إلغاء المقارنة"
                    >
                        <X className="w-5 h-5" />
                    </Button>

                    <Link to="/compare">
                        <Button
                            size="sm"
                            className="bg-neon-purple hover:bg-neon-purple/80 text-white font-bold px-6 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                            disabled={selectedTools.length < 2} // لا تسمح بالذهاب إذا كانت أداة واحدة
                        >
                            مقارنة <ArrowLeft className="w-4 h-4 mr-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CompareFloatingBar;
