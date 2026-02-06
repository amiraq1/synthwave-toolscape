/**
 * 🚀 Performance Optimization Utilities for نبض AI
 * Collection of utilities to improve loading and runtime performance
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// ============================================
// 📷 Image Optimization
// ============================================

/**
 * Generate optimized image URL with proper sizing
 * Uses Supabase image transformation or external services
 */
export const getOptimizedImageUrl = (
    url: string | null | undefined,
    options: {
        width?: number;
        quality?: number;
        format?: 'webp' | 'avif' | 'auto';
    } = {}
): string => {
    if (!url) return '';

    const { width = 400, quality = 80, format = 'auto' } = options;

    // If it's a Supabase storage URL, use transformation
    if (url.includes('supabase.co/storage')) {
        const formatParam = format ? `&format=${format}` : '';
        return `${url}?width=${width}&quality=${quality}${formatParam}`;
    }

    // For external URLs, use a proxy/optimizer or return as-is
    return url;
};

/**
 * Preload critical images above the fold
 */
export const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
    });
};

// ============================================
// 🔄 Intersection Observer Hook
// ============================================

interface UseIntersectionObserverOptions {
    threshold?: number | number[];
    rootMargin?: string;
    triggerOnce?: boolean;
}

export const useIntersectionObserver = (
    options: UseIntersectionObserverOptions = {}
): [React.RefObject<HTMLDivElement>, boolean] => {
    const { threshold = 0.1, rootMargin = '50px', triggerOnce = true } = options;
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.disconnect();
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [threshold, rootMargin, triggerOnce]);

    return [ref, isVisible];
};

// ============================================
// ⏱️ Debounce & Throttle
// ============================================

/**
 * Debounce hook for expensive operations
 */
export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

/**
 * Throttle function for scroll/resize handlers
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

// ============================================
// 📦 Lazy Component Loading
// ============================================

/**
 * Preload a lazy-loaded component
 */
export const preloadComponent = (
    importFn: () => Promise<{ default: React.ComponentType }>
): void => {
    importFn();
};

/**
 * Prefetch data for a route before navigation
 */
export const prefetchRoute = async (
    routePath: string,
    dataFetcher?: () => Promise<unknown>
): Promise<void> => {
    // Prefetch the route component (if using code splitting)
    // This would typically integrate with your router

    // Prefetch data if provided
    if (dataFetcher) {
        try {
            await dataFetcher();
        } catch (error) {
            console.warn(`Failed to prefetch data for ${routePath}:`, error);
        }
    }
};

// ============================================
// 🎯 Virtual List Hook (for large lists)
// ============================================

interface VirtualListOptions {
    itemHeight: number;
    overscan?: number;
}

export const useVirtualList = <T>(
    items: T[],
    containerHeight: number,
    options: VirtualListOptions
): {
    virtualItems: { item: T; index: number; style: React.CSSProperties }[];
    totalHeight: number;
    containerProps: {
        onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
        style: React.CSSProperties;
    };
} => {
    const { itemHeight, overscan = 3 } = options;
    const [scrollTop, setScrollTop] = useState(0);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const virtualItems = items.slice(startIndex, endIndex + 1).map((item, i) => ({
        item,
        index: startIndex + i,
        style: {
            position: 'absolute' as const,
            top: (startIndex + i) * itemHeight,
            height: itemHeight,
            left: 0,
            right: 0,
        },
    }));

    return {
        virtualItems,
        totalHeight,
        containerProps: {
            onScroll: handleScroll,
            style: {
                height: containerHeight,
                overflow: 'auto',
                position: 'relative',
            },
        },
    };
};

// ============================================
// 💾 Memoization Utilities
// ============================================

/**
 * Simple memoization for expensive computations
 */
export const memoize = <T extends (...args: unknown[]) => unknown>(
    fn: T,
    keyResolver?: (...args: Parameters<T>) => string
): T => {
    const cache = new Map<string, ReturnType<T>>();

    return ((...args: Parameters<T>): ReturnType<T> => {
        const key = keyResolver ? keyResolver(...args) : JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key)!;
        }

        const result = fn(...args) as ReturnType<T>;
        cache.set(key, result);
        return result;
    }) as T;
};

// ============================================
// 🔋 Battery-aware Features
// ============================================

/**
 * Hook to detect low battery and reduce animations
 */
export const useBatteryAware = (): { isLowBattery: boolean; isCharging: boolean } => {
    const [batteryInfo, setBatteryInfo] = useState({
        isLowBattery: false,
        isCharging: true,
    });

    useEffect(() => {
        const updateBatteryInfo = async () => {
            try {
                // @ts-expect-error - getBattery is not in all browsers
                const battery = await navigator.getBattery?.();
                if (battery) {
                    setBatteryInfo({
                        isLowBattery: battery.level < 0.2 && !battery.charging,
                        isCharging: battery.charging,
                    });

                    battery.addEventListener('levelchange', () => {
                        setBatteryInfo({
                            isLowBattery: battery.level < 0.2 && !battery.charging,
                            isCharging: battery.charging,
                        });
                    });
                }
            } catch {
                // Battery API not available
            }
        };

        updateBatteryInfo();
    }, []);

    return batteryInfo;
};

// ============================================
// 📊 Performance Monitoring
// ============================================

/**
 * Hook to measure component render time
 */
export const useRenderTime = (componentName: string): void => {
    const startTime = useRef(performance.now());

    useEffect(() => {
        const endTime = performance.now();
        const duration = endTime - startTime.current;

        if (duration > 16) {
            // Log slow renders (> 1 frame at 60fps)
            console.warn(`⚠️ Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
        }
    });
};

/**
 * Report Core Web Vitals
 */
export const reportWebVitals = (): void => {
    if (typeof window === 'undefined') return;

    const logVital = (metric: { name: string; value: number }) => {
        console.warn(`[WebVitals] ${metric.name}: ${metric.value}`);
    };

    // Use web-vitals library if available
    import('web-vitals').then(({ onCLS, onFID, onLCP, onFCP, onTTFB }) => {
        onCLS(logVital);
        onFID(logVital);
        onLCP(logVital);
        onFCP(logVital);
        onTTFB(logVital);
    }).catch(() => {
        // web-vitals not installed
    });
};

export default {
    getOptimizedImageUrl,
    preloadImage,
    preloadComponent,
    prefetchRoute,
    memoize,
    throttle,
    reportWebVitals,
};
