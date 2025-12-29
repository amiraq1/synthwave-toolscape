import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  onError?: () => void;
  /** Fixed dimensions to prevent CLS */
  width?: number;
  height?: number;
  /** If true, load immediately (for above-the-fold images) */
  priority?: boolean;
}

/**
 * LazyImage - مكون صور محسّن مع:
 * - Lazy loading باستخدام IntersectionObserver
 * - loading="lazy" و decoding="async" للأداء
 * - أبعاد ثابتة لمنع CLS
 * - Placeholder skeleton أثناء التحميل
 */
const LazyImage = ({
  src,
  alt,
  className,
  placeholderClassName,
  onError,
  width,
  height,
  priority = false
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return; // Skip observer for priority images

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px', threshold: 0.01 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
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

  if (hasError) {
    return null;
  }

  // Filter out problematic URLs
  const safeSrc = src && !src.includes('wikimedia.org') ? src : '';

  return (
    <div
      ref={imgRef}
      className={cn("relative", className)}
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }}
    >
      {/* Placeholder skeleton */}
      <div
        className={cn(
          "absolute inset-0 bg-muted animate-pulse rounded-lg transition-opacity duration-300",
          placeholderClassName,
          isLoaded ? "opacity-0" : "opacity-100"
        )}
        aria-hidden="true"
      />

      {/* Actual image - only render when in view */}
      {isInView && safeSrc && (
        <img
          src={safeSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-contain transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
};

export default LazyImage;
