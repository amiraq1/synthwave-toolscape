import { useState, useEffect } from "react";

/**
 * @desc خطاف ذكي لتأجيل تحميل واجهات المستخدم الثانوية.
 * يوقف الاختناقات عبر انتظار استشعار تفاعل المستخدم أو مرور الوقت الكافي.
 * خالي من تسرب الذاكرة. مخصص للتطبيقات الرائدة.
 */
export function useIdleLoad(timeoutMs = 12000) {
    const [isIdle, setIsIdle] = useState(false);

    useEffect(() => {
        let activated = false;
        const activate = () => {
            if (activated) return;
            activated = true;
            setIsIdle(true);
            window.removeEventListener("pointerdown", activate);
            window.removeEventListener("keydown", activate);
            window.removeEventListener("scroll", activate);
        };

        // Passive flags for max scroll performance (Lighthouse 100)
        window.addEventListener("pointerdown", activate, { passive: true });
        window.addEventListener("keydown", activate, { passive: true });
        window.addEventListener("scroll", activate, { passive: true });

        const timeoutId = window.setTimeout(activate, timeoutMs);

        return () => {
            window.clearTimeout(timeoutId);
            window.removeEventListener("pointerdown", activate);
            window.removeEventListener("keydown", activate);
            window.removeEventListener("scroll", activate);
        };
    }, [timeoutMs]);

    return isIdle;
}
