import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// تأجيل تحميل i18n وdayjs - ليس ضروري للعرض الأولي
const loadI18nAndDate = async () => {
    // تحميل i18n
    await import('./i18n');

    // تحميل dayjs وإعداداته
    const dayjs = (await import('dayjs')).default;
    const relativeTime = (await import('dayjs/plugin/relativeTime')).default;
    await import('dayjs/locale/ar');

    dayjs.extend(relativeTime);
    dayjs.locale('ar');
};

// تحميل الترجمات فوراً لكن بشكل غير متزامن
loadI18nAndDate();

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

// تسجيل Service Worker يدويًا بعد تحميل الصفحة (لتجنب حظر العرض)
const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
        try {
            const { registerSW } = await import('virtual:pwa-register');
            registerSW({
                immediate: false,
                onRegistered(r) {
                    console.log('SW registered:', r);
                },
                onRegisterError(error) {
                    console.error('SW registration error:', error);
                }
            });
        } catch (error) {
            console.error('Failed to register SW:', error);
        }
    }
};

// تأجيل تسجيل SW حتى يصبح المتصفح غير مشغول
if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => registerServiceWorker());
} else {
    setTimeout(registerServiceWorker, 2000);
}
