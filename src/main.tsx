import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ar';

// Self-hosted fonts (faster than Google Fonts CDN)
import "@fontsource/cairo/400.css";
import "@fontsource/cairo/600.css";
import "@fontsource/cairo/700.css";
import "@fontsource/cairo/800.css";
import "@fontsource/ibm-plex-sans-arabic/300.css";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";

dayjs.extend(relativeTime);
dayjs.locale('ar');

if (typeof window !== "undefined" && !window.localStorage.getItem("i18nextLng")) {
    window.localStorage.setItem("i18nextLng", "ar");
}

// Production-safe Error Boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    minHeight: '100vh', background: '#0f0f1a', color: 'white', fontFamily: 'system-ui, sans-serif',
                    direction: 'ltr', padding: '2rem', textAlign: 'center'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Unexpected error occurred</h1>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem', maxWidth: '400px' }}>Please refresh the page and try again.</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: '#7c3aed', color: 'white', border: 'none', borderRadius: '0.75rem',
                            padding: '0.75rem 2rem', fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const initMonitoring = () => {
    // Sentry placeholder — uncomment when ready:
    // Sentry.init({...})
};

if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
        initMonitoring();
    });
} else {
    setTimeout(initMonitoring, 3000);
}

// Global error handler — log only, never expose to DOM
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Rejection:', event.reason);
    // TODO: Send to Sentry/monitoring service in production
});

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
);
