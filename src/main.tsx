/// <reference types="vite-plugin-pwa/client" />
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';

// تأجيل تحميل dayjs - ليس ضروري للعرض الأولي
const loadDate = async () => {
    // تحميل dayjs وإعداداته
    const dayjs = (await import('dayjs')).default;
    const relativeTime = (await import('dayjs/plugin/relativeTime')).default;
    await import('dayjs/locale/ar');

    dayjs.extend(relativeTime);
    dayjs.locale('ar');
};

loadDate();

// دالة لتهيئة Sentry فقط عندما يكون المتصفح "مرتاحاً"
// TODO: إعادة تفعيل Sentry بعد حل المشاكل
const initMonitoring = () => {
    // Sentry.init({
    //     dsn: "https://93afb9202654e4183b0876bde628d4c4@o4510224060317696.ingest.us.sentry.io/4510676177649664",
    //     integrations: [
    //         Sentry.browserTracingIntegration(),
    //         Sentry.replayIntegration(),
    //     ],
    //     tracesSampleRate: 1.0,
    //     replaysSessionSampleRate: 0.1,
    //     replaysOnErrorSampleRate: 1.0,
    // });
};

// استخدام requestIdleCallback لتأجيل التحميل (متوفرة في المتصفحات الحديثة)
if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
        initMonitoring();
    });
} else {
    // للمتصفحات القديمة: انتظر 3 ثواني ثم شغل المراقبة
    setTimeout(initMonitoring, 3000);
}

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);

const clearServiceWorkersAndCaches = async () => {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));

        if ('caches' in window) {
            const cacheKeys = await caches.keys();
            await Promise.all(cacheKeys.map((cacheKey) => caches.delete(cacheKey)));
        }
    } catch (error) {
        console.error('Failed to clear service workers and caches:', error);
    }
};

// لا نعيد تسجيل Service Worker حاليًا حتى نكسر أي كاش قديم يوجه للـ bundles السابقة.
const manageServiceWorker = async () => {
    await clearServiceWorkersAndCaches();
};

// تأجيل إدارة SW حتى يصبح المتصفح غير مشغول
if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => manageServiceWorker());
} else {
    setTimeout(manageServiceWorker, 2000);
}
