import { useEffect } from "react"
import { registerSW } from "virtual:pwa-register"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

export function PwaUpdateToast() {
    const { t } = useTranslation()
    useEffect(() => {
        let isCancelled = false
        let cleanupIdle: (() => void) | null = null

        const mountServiceWorker = () => {
            if (isCancelled) return

            const updateSW = registerSW({
                // 1. عند وجود تحديث جديد (نسخة جديدة من التطبيق)
                onNeedRefresh() {
                    toast(t('pwa.update_title'), {
                        description: t('pwa.update_desc'),
                        duration: Infinity, // التنبيه لا يختفي حتى يتفاعل المستخدم معه
                        action: {
                            label: t('pwa.update_btn'),
                            onClick: () => {
                                // true تعني: قم بتحديث الصفحة وتحميل النسخة الجديدة
                                updateSW(true)
                            },
                        },
                        // خيار للإغلاق إذا لم يرغب المستخدم في التحديث فوراً
                        cancel: {
                            label: t('pwa.later'),
                            onClick: () => { },
                        },
                    })
                },

                // 2. عندما يصبح التطبيق جاهزاً للعمل بدون إنترنت (Offline)
                onOfflineReady() {
                    toast.success(t('pwa.offline_ready'), {
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
