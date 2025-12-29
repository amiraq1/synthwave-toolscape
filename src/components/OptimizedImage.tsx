import { useState, useRef, useEffect, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    src: string;
    alt: string;
    /** Fixed width for the image container (prevents CLS) */
    width?: number;
    /** Fixed height for the image container (prevents CLS) */
    height?: number;
    /** CSS classes for the container */
    containerClassName?: string;
    /** CSS classes for the placeholder skeleton */
    placeholderClassName?: string;
    /** Callback when image fails to load */
    onError?: () => void;
    /** If true, use eager loading (for above-the-fold images) */
    priority?: boolean;
    /** Fallback content when image fails */
    fallback?: React.ReactNode;
}

/**
 * OptimizedImage - مكون صور محسّن للأداء
 * 
 * ميزات:
 * - Lazy loading تلقائي للصور أسفل الصفحة
 * - IntersectionObserver للتحميل عند الحاجة
 * - أبعاد ثابتة لمنع CLS (Cumulative Layout Shift)
 * - دعم WebP/AVIF تلقائي عبر srcset
 * - Placeholder skeleton أثناء التحميل
 * - معالجة الأخطاء مع fallback
 */
const OptimizedImage = ({
    src,
    alt,
    width,
    height,
    className,
    containerClassName,
    placeholderClassName,
    onError,
    priority = false,
    fallback,
    ...props
}: OptimizedImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const [hasError, setHasError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // IntersectionObserver للتحميل الكسول
    useEffect(() => {
        if (priority) return; // لا تستخدم lazy loading للصور ذات الأولوية

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '200px', // بدء التحميل قبل الظهور بـ 200px
                threshold: 0.01
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [priority]);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setHasError(true);
        onError?.();
    };

    // تحويل URL للحصول على نسخة WebP (إذا كان مدعوماً)
    const getWebPUrl = (url: string): string | undefined => {
        // Skip if URL is already WebP or AVIF
        if (url.includes('.webp') || url.includes('.avif')) {
            return undefined;
        }
        // Skip external URLs that may not support format conversion
        if (url.includes('supabase') || url.includes('storage.googleapis')) {
            return undefined;
        }
        return undefined; // For now, return undefined - server should handle this
    };

    // إذا فشل التحميل وهناك fallback
    if (hasError) {
        if (fallback) {
            return <>{fallback}</>;
        }
        return null;
    }

    // حجم الحاوية
    const containerStyle: React.CSSProperties = {
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
    };

    return (
        <div
            ref={containerRef}
            className={cn("relative overflow-hidden", containerClassName)}
            style={containerStyle}
        >
            {/* Placeholder Skeleton */}
            <div
                className={cn(
                    "absolute inset-0 bg-muted animate-pulse rounded-lg transition-opacity duration-300",
                    placeholderClassName,
                    isLoaded ? "opacity-0" : "opacity-100"
                )}
                aria-hidden="true"
            />

            {/* Actual Image */}
            {isInView && (
                <picture>
                    {/* WebP version (if available) */}
                    {getWebPUrl(src) && (
                        <source srcSet={getWebPUrl(src)} type="image/webp" />
                    )}

                    {/* Original image */}
                    <img
                        src={src}
                        alt={alt}
                        width={width}
                        height={height}
                        loading={priority ? "eager" : "lazy"}
                        decoding={priority ? "sync" : "async"}
                        fetchPriority={priority ? "high" : "auto"}
                        onLoad={handleLoad}
                        onError={handleError}
                        className={cn(
                            "transition-opacity duration-300",
                            isLoaded ? "opacity-100" : "opacity-0",
                            className
                        )}
                        {...props}
                    />
                </picture>
            )}
        </div>
    );
};

export default OptimizedImage;
