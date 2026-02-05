import { useEffect } from "react"
import { registerSW } from "virtual:pwa-register"
import { toast } from "sonner"

export function PwaUpdateToast() {
    useEffect(() => {
        // هذه الدالة تقوم بتسجيل الـ Service Worker
        const updateSW = registerSW({
            // 1. عند وجود تحديث جديد (نسخة جديدة من التطبيق)
            onNeedRefresh() {
                toast("تحديث جديد متوفر", {
                    description: "تم تحميل نسخة جديدة من التطبيق. انقر للتحديث.",
                    duration: Infinity, // التنبيه لا يختفي حتى يتفاعل المستخدم معه
                    action: {
                        label: "تحديث الآن",
                        onClick: () => {
                            // true تعني: قم بتحديث الصفحة وتحميل النسخة الجديدة
                            updateSW(true)
                        },
                    },
                    // خيار للإغلاق إذا لم يرغب المستخدم في التحديث فوراً
                    cancel: {
                        label: "لاحقاً",
                        onClick: () => { },
                    },
                })
            },

            // 2. عندما يصبح التطبيق جاهزاً للعمل بدون إنترنت (Offline)
            onOfflineReady() {
                toast.success("التطبيق جاهز للعمل بدون إنترنت", {
                    duration: 3000,
                })
            },

            // التعامل مع الأخطاء
            onRegisterError(error) {
                console.error("SW registration error", error)
            },
        })
    }, [])

    return null // هذا المكون لا يعرض شيئاً على الشاشة (فقط التنبيهات)
}
