
// تعريف الأنواع لـ window
declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
        heap?: {
            envId?: string;
            clientConfig?: { shouldFetchServerConfig?: boolean };
            trackPageview?: () => void;
            [key: string]: unknown;
        };
        heapReadyCb?: Array<{ name: string; fn: () => void }>;
    }
}

// الحصول على معرف القياس من متغيرات البيئة
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_ID;
const HEAP_APP_ID = "1749502766";

// تهيئة Google Analytics
export const initGA = () => {
    // لا تقم بالتهيئة إذا لم يكن المعرف موجوداً (مثلاً في بيئة التطوير المحلية)
    if (!GA_MEASUREMENT_ID) {
        // console.log('Google Analytics: ID missing, skipping initialization');
        return;
    }

    // تجنب إعادة تحميل السكربت إذا كان موجوداً
    if (window.gtag) return;

    // تحميل سكربت gtag.js
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // إعداد dataLayer
    window.dataLayer = window.dataLayer || [];

    // دالة gtag
    window.gtag = (...args: unknown[]) => {
        window.dataLayer?.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: false // سنقوم بإرسالها يدوياً عند تغيير المسار
    });

};

export const initHeap = () => {
    if (!HEAP_APP_ID) return;
    if (typeof window.heap?.track === 'function') return;

    window.heapReadyCb = window.heapReadyCb || [];
    window.heap = window.heap || {};

    const heap = window.heap as Record<string, unknown> & {
        load?: (appId: string, config?: { shouldFetchServerConfig?: boolean }) => void;
    };

    heap.load = function (appId: string, config?: { shouldFetchServerConfig?: boolean }) {
        window.heap = window.heap || {};
        window.heap.envId = appId;
        window.heap.clientConfig = config || {};
        window.heap.clientConfig.shouldFetchServerConfig = false;

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.src = `https://cdn.us.heap-api.com/config/${appId}/heap_config.js`;

        const firstScript = document.getElementsByTagName('script')[0];
        firstScript?.parentNode?.insertBefore(script, firstScript);

        const methods = [
            'init', 'startTracking', 'stopTracking', 'track', 'resetIdentity', 'identify',
            'getSessionId', 'getUserId', 'getIdentity', 'addUserProperties', 'addEventProperties',
            'removeEventProperty', 'clearEventProperties', 'addAccountProperties', 'addAdapter',
            'addTransformer', 'addTransformerFn', 'onReady', 'addPageviewProperties',
            'removePageviewProperty', 'clearPageviewProperties', 'trackPageview'
        ];

        const createMethod = (name: string) => (...args: unknown[]) => {
            window.heapReadyCb?.push({
                name,
                fn: () => {
                    const method = window.heap?.[name];
                    if (typeof method === 'function') {
                        (method as (...input: unknown[]) => void)(...args);
                    }
                }
            });
        };

        methods.forEach((method) => {
            heap[method] = createMethod(method);
        });
    };

    heap.load(HEAP_APP_ID);
};

// تسجيل مشاهدة صفحة (Page View)
export const logPageView = (path: string) => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;

    window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: path,
    });
};

export const logHeapPageView = () => {
    if (typeof window.heap?.trackPageview === 'function') {
        window.heap.trackPageview();
    }
};

// تسجيل حدث مخصص (Event)
export const logEvent = (action: string, category: string, label: string, value?: number) => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;

    window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
    });
};
