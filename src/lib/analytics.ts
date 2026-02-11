
// تعريف الأنواع لـ window
declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
    }
}

// الحصول على معرف القياس من متغيرات البيئة
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_ID;

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

// تسجيل مشاهدة صفحة (Page View)
export const logPageView = (path: string) => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;

    window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: path,
    });
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
