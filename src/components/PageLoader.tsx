import { Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

const PageLoader = () => {
    const [isTimeout, setIsTimeout] = useState(false);

    useEffect(() => {
        // Set a 10-second timeout to show error message if loading takes too long
        const timer = setTimeout(() => {
            setIsTimeout(true);
        }, 10000);

        return () => clearTimeout(timer);
    }, []);

    if (isTimeout) {
        return (
            <div className="fixed inset-0 bg-[#0f0f1a] flex flex-col items-center justify-center z-50">
                <div className="relative">
                    <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                    <AlertCircle className="w-12 h-12 text-red-500 relative z-10" />
                </div>
                <p className="mt-4 text-gray-400 text-sm font-cairo">
                    حدث تأخير في التحميل. يرجى تحديث الصفحة
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-neon-purple hover:bg-neon-purple/80 text-white rounded-lg transition-colors"
                >
                    تحديث الصفحة
                </button>
            </div>
        );
    }

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
