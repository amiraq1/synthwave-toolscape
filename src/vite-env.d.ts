/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Type declaration for vite-plugin-pwa virtual module
declare module 'virtual:pwa-register' {
    export interface RegisterSWOptions {
        immediate?: boolean;
        onNeedRefresh?: () => void;
        onOfflineReady?: () => void;
        onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
        onRegisterError?: (error: Error) => void;
    }

    export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

// تعريف حدث تثبيت PWA
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

// إضافة الحدث إلى النافذة (Window)
declare global {
    interface WindowEventMap {
        'beforeinstallprompt': BeforeInstallPromptEvent;
    }
}
