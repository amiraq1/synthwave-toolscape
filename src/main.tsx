import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from "@sentry/react";

// دالة لتهيئة Sentry فقط عندما يكون المتصفح "مرتاحاً"
const initMonitoring = () => {
    Sentry.init({
        dsn: "https://93afb9202654e4183b0876bde628d4c4@o4510224060317696.ingest.us.sentry.io/4510676177649664",
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration(),
        ],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
    });
};

// استخدام requestIdleCallback لتأجيل التحميل
if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
        initMonitoring();
    });
} else {
    // للمتصفحات القديمة: انتظر 3 ثواني ثم شغل المراقبة
    setTimeout(initMonitoring, 3000);
}

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <HelmetProvider>
            <App />
        </HelmetProvider>
    </React.StrictMode>,
);
