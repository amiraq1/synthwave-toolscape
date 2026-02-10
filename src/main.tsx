
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

// Simple Error Boundary
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
                <div style={{ padding: 20, color: 'white', background: '#333', height: '100vh', direction: 'ltr' }}>
                    <h1>Something went wrong.</h1>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.stack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

const initMonitoring = () => {
    // Sentry placeholder
    // Sentry.init({...})
};

if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
        initMonitoring();
    });
} else {
    setTimeout(initMonitoring, 3000);
}

// Global error handler for uncaught promises (outside React)
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Rejection:', event.reason);
    // Optionally create a visible element if React is dead
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '0';
    errorDiv.style.left = '0';
    errorDiv.style.width = '100%';
    errorDiv.style.background = 'red';
    errorDiv.style.color = 'white';
    errorDiv.style.zIndex = '9999';
    errorDiv.innerText = 'Unhandled Rejection: ' + event.reason;
    document.body.appendChild(errorDiv);
});

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
);
