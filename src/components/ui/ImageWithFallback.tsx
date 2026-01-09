import { useState } from "react";
import { ImageOff } from "lucide-react";
import { optimizeImage } from "@/utils/imageOptimizer";

interface ImageWithFallbackProps {
    src?: string | null;
    alt: string;
    className?: string;
    width?: number; // عرض الصورة للتحسين
}

const ImageWithFallback = ({ src, alt, className = "", width = 400 }: ImageWithFallbackProps) => {
    const [error, setError] = useState(false);

    // إذا لم يكن هناك رابط، أو حدث خطأ في التحميل، اعرض البديل
    if (!src || error) {
        return (
            <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 ${className}`}>
                <ImageOff className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-xs text-gray-500 font-cairo">لا توجد صورة</span>
            </div>
        );
    }

    // إذا كان الرابط موجوداً، حاول عرضه
    return (
        <img
            src={optimizeImage(src, width)}
            alt={alt}
            className={className}
            onError={() => setError(true)} // عند حدوث خطأ، قم بتغيير الحالة لعرض البديل
            loading="lazy"
        />
    );
};

export default ImageWithFallback;
