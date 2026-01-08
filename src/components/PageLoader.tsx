import { Loader2 } from "lucide-react";

const PageLoader = () => {
    return (
        <div className="fixed inset-0 bg-[#0f0f1a] flex flex-col items-center justify-center z-50">
            <div className="relative">
                <div className="absolute inset-0 bg-neon-purple/20 blur-xl rounded-full" />
                <Loader2 className="w-12 h-12 text-neon-purple animate-spin relative z-10" />
            </div>
            <p className="mt-4 text-gray-400 text-sm animate-pulse font-cairo">
                جاري تحميل نبض AI...
            </p>
        </div>
    );
};

export default PageLoader;
