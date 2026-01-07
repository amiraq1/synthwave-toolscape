import { useCompare } from "@/context/CompareContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const CompareFloatingBar = () => {
    const { selectedTools, clearCompare } = useCompare();

    if (selectedTools.length === 0) return null;

    return (
        <div
            className={cn(
                "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4",
                "animate-fade-in"
            )}
        >
            <div className="bg-black/80 backdrop-blur-xl border border-neon-purple/50 rounded-full p-3 shadow-[0_0_30px_rgba(124,58,237,0.3)] flex items-center justify-between">
                {/* Left Side - Info */}
                <div className="flex items-center gap-3 px-2">
                    <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-neon-purple" />
                        <span className="text-white font-bold text-sm">
                            {selectedTools.length} أدوات محددة
                        </span>
                    </div>
                    <button
                        onClick={clearCompare}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
                        aria-label="إلغاء المقارنة"
                    >
                        <X className="w-3 h-3" />
                        إلغاء
                    </button>
                </div>

                {/* Right Side - Compare Button */}
                <Link to={`/compare?tools=${selectedTools.join(',')}`}>
                    <Button
                        size="sm"
                        className="bg-neon-purple hover:bg-neon-purple/80 rounded-full px-6 gap-2"
                    >
                        مقارنة
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default CompareFloatingBar;
