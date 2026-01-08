import { useCompare } from "@/context/CompareContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CompareFloatingBar = () => {
    const { selectedTools, clearCompare } = useCompare();
    const { i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    const Arrow = isAr ? ArrowLeft : ArrowRight;

    if (selectedTools.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-bottom-5 duration-300">
            <div
                className="bg-[#1a1a2e]/90 backdrop-blur-xl border border-neon-purple/50 rounded-full p-2 pl-6 shadow-[0_0_30px_rgba(124,58,237,0.3)] flex items-center justify-between"
                dir={isAr ? "rtl" : "ltr"}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-neon-purple/20 p-2 rounded-full">
                        <Scale className="w-4 h-4 text-neon-purple" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-sm">
                            {isAr
                                ? `${selectedTools.length} أدوات محددة`
                                : `${selectedTools.length} tools selected`
                            }
                        </span>
                        <button
                            onClick={clearCompare}
                            className="text-[10px] text-gray-400 hover:text-red-400 text-right underline"
                        >
                            {isAr ? "إلغاء الكل" : "Clear all"}
                        </button>
                    </div>
                </div>

                <Link to="/compare">
                    <Button size="sm" className="bg-neon-purple hover:bg-neon-purple/80 rounded-full px-6 h-9">
                        {isAr ? "مقارنة" : "Compare"} <Arrow className="w-4 h-4 mr-2" />
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default CompareFloatingBar;
