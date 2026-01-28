import { useState, useCallback } from "react";
import { ImageOff } from "lucide-react";
import { optimizeImage } from "@/utils/imageOptimizer";
import { cn } from "@/lib/utils";

interface ImageWithFallbackProps {
    src?: string | null;
    alt: string;
    className?: string;
    containerClassName?: string;
    width?: number;
    priority?: boolean;
    aspectRatio?: "square" | "video" | "wide" | "auto";
}

/**
 * مكون صورة محسّن مع:
 * ✅ Blur-up loading effect
 * ✅ Lazy loading
 * ✅ Error fallback
 * ✅ Aspect ratio container (prevents CLS)
 * ✅ CDN optimization
 */
const ImageWithFallback = ({
    src,
    alt,
    className = "",
    containerClassName = "",
    width = 400,
    priority = false,
    aspectRatio = "auto"
}: ImageWithFallbackProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleLoad = useCallback(() => {
        setIsLoading(false);
    }, []);

    const handleError = useCallback(() => {
        setError(true);
        setIsLoading(false);
    }, []);

    // Aspect ratio classes
    const aspectClasses = {
        square: "aspect-square",
        video: "aspect-video",
        wide: "aspect-[21/9]",
        auto: ""
    };

    // إذا لم يكن هناك رابط، أو حدث خطأ في التحميل، اعرض البديل
    if (!src || error) {
        return (
            <div className={cn(
                "flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10",
                aspectClasses[aspectRatio],
                containerClassName,
                className
            )}>
                <ImageOff className="w-8 h-8 text-gray-600 mb-2" />
                <span className="text-xs text-gray-500 font-cairo">لا توجد صورة</span>
            </div>
        );
    }

    return (
        <div className={cn(
            "relative overflow-hidden",
            aspectClasses[aspectRatio],
            containerClassName
        )}>
            {/* Blur Placeholder - يظهر أثناء التحميل */}
            {isLoading && (
                <div
                    className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-neon-blue/5 animate-pulse"
                    aria-hidden="true"
                />
            )}

            {/* الصورة الفعلية */}
            <img
                src={optimizeImage(src, width)}
                alt={alt}
                className={cn(
                    "transition-opacity duration-300",
                    isLoading ? "opacity-0" : "opacity-100",
                    className
                )}
                onLoad={handleLoad}
                onError={handleError}
                loading={priority ? "eager" : "lazy"}
                decoding={priority ? "sync" : "async"}
                // @ts-expect-error fetchpriority is a valid attribute but not yet in React types
                fetchpriority={priority ? "high" : "auto"}
            />
        </div>
    );
};

export default ImageWithFallback;
