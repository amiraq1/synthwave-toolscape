import { useEffect } from "react"
import { registerSW } from "virtual:pwa-register"
import { toast } from "sonner"

export function PwaUpdateToast() {
    useEffect(() => {
        let isCancelled = false
        let cleanupIdle: (() => void) | null = null

        const mountServiceWorker = () => {
            if (isCancelled) return

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
        }

        const scheduleRegistration = () => {
            const requestIdle = (window as Window & { requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number }).requestIdleCallback

            if (typeof requestIdle === "function") {
                const idleId = requestIdle(() => mountServiceWorker(), { timeout: 5_000 })
                cleanupIdle = () => {
                    const cancelIdle = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback
                    if (typeof cancelIdle === "function") cancelIdle(idleId)
                }
                return
            }

            const timeoutId = window.setTimeout(() => mountServiceWorker(), 3_000)
            cleanupIdle = () => window.clearTimeout(timeoutId)
        }

        // لا تسجل SW أثناء المسار الحرج؛ انتظر load ثم idle.
        if (document.readyState === "complete") {
            scheduleRegistration()
        } else {
            window.addEventListener("load", scheduleRegistration, { once: true })
        }

        return () => {
            isCancelled = true
            cleanupIdle?.()
            window.removeEventListener("load", scheduleRegistration)
        }
    }, [])

    return null // هذا المكون لا يعرض شيئاً على الشاشة (فقط التنبيهات)
}
