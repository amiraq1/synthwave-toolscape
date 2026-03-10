import { Loader2 } from "lucide-react";

const PageLoader = () => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50" style={{ background: 'linear-gradient(180deg, #faf7f0 0%, #f3efe6 42%, #e9e0d1 100%)' }}>
            <div className="relative">
                <div className="absolute inset-0 bg-teal-600/15 blur-xl rounded-full" />
                <Loader2 className="w-12 h-12 text-teal-700 animate-spin relative z-10" />
            </div>
            <p className="mt-4 text-slate-500 text-sm animate-pulse font-cairo">
                جاري تحميل نبض AI...
            </p>
        </div>
    );
};

export default PageLoader;
