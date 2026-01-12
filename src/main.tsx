import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';
// Note: HelmetProvider is already in App.tsx, no need to duplicate here

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
