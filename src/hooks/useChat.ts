import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    timestamp?: number;
    status?: 'sending' | 'sent' | 'error';
    responseTime?: number; // بالمللي ثانية
}

export interface ChatResponse {
    answer: string;
    tools: unknown[];
}

export type ErrorType = 'auth' | 'network' | 'server' | 'timeout' | 'cancelled' | 'unknown';

export interface ChatError {
    type: ErrorType;
    message: string;
    retryable: boolean;
}

export interface RetryState {
    attempt: number;
    maxAttempts: number;
    isRetrying: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MAX_RETRY_ATTEMPTS = 3;
const BASE_RETRY_DELAY = 1000; // 1 ثانية
const REQUEST_TIMEOUT = 30000; // 30 ثانية

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * تحديد نوع الخطأ ورسالته
 */
const classifyError = (err: unknown): ChatError => {
    const error = err as {
        context?: { status?: number };
        message?: string;
        name?: string;
    } | null;

    // خطأ إلغاء الطلب
    if (error?.name === 'AbortError') {
        return {
            type: 'cancelled',
            message: 'تم إلغاء الطلب',
            retryable: false
        };
    }

    // خطأ المصادقة
    if (error?.context?.status === 401 ||
        error?.message?.includes('401') ||
        error?.message?.includes('تسجيل الدخول') ||
        error?.message?.includes('unauthorized')) {
        return {
            type: 'auth',
            message: 'يجب تسجيل الدخول لاستخدام نبض AI',
            retryable: false
        };
    }

    // خطأ الشبكة
    if (error?.message?.includes('network') ||
        error?.message?.includes('fetch') ||
        error?.message?.includes('Failed to fetch') ||
        !navigator.onLine) {
        return {
            type: 'network',
            message: 'خطأ في الاتصال. تحقق من اتصالك بالإنترنت',
            retryable: true
        };
    }

    // خطأ الخادم (5xx)
    if (error?.context?.status && error.context.status >= 500) {
        return {
            type: 'server',
            message: 'خطأ في الخادم. يرجى المحاولة لاحقاً',
            retryable: true
        };
    }

    // خطأ انتهاء الوقت
    if (error?.message?.includes('timeout') || error?.name === 'TimeoutError') {
        return {
            type: 'timeout',
            message: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى',
            retryable: true
        };
    }

    // خطأ غير معروف
    return {
        type: 'unknown',
        message: error?.message || 'حدث خطأ غير متوقع',
        retryable: true
    };
};

/**
 * تأخير مع exponential backoff
 */
const delay = (attempt: number): Promise<void> => {
    const ms = BASE_RETRY_DELAY * Math.pow(2, attempt - 1); // 1s, 2s, 4s
    return new Promise(resolve => setTimeout(resolve, ms));
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Hook
// ─────────────────────────────────────────────────────────────────────────────

export const useChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<ChatError | null>(null);
    const [retryState, setRetryState] = useState<RetryState>({
        attempt: 0,
        maxAttempts: MAX_RETRY_ATTEMPTS,
        isRetrying: false
    });

    // للتحكم في إلغاء الطلبات
    const abortControllerRef = useRef<AbortController | null>(null);

    // لمنع الطلبات المتزامنة
    const isProcessingRef = useRef(false);

    // قائمة انتظار الرسائل
    const messageQueueRef = useRef<string[]>([]);

    /**
     * إلغاء الطلب الحالي
     */
    const cancelRequest = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
            setRetryState(prev => ({ ...prev, isRetrying: false, attempt: 0 }));
        }
    }, []);

    /**
     * استدعاء API مع دعم إلغاء الطلب والـ timeout
     */
    const invokeWithTimeout = async (
        query: string,
        history: { role: string; content: string }[],
        accessToken: string,
        signal: AbortSignal
    ): Promise<ChatResponse> => {
        // إنشاء promise للـ timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new Error('timeout'));
            }, REQUEST_TIMEOUT);
        });

        // استدعاء الـ API
        const fetchPromise = supabase.functions.invoke('chat', {
            body: { query, history },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        // السباق بين الـ timeout والـ fetch
        const result = await Promise.race([fetchPromise, timeoutPromise]);

        // التحقق من الإلغاء
        if (signal.aborted) {
            throw new Error('AbortError');
        }

        const { data, error: funcError } = result as { data: ChatResponse; error: Error | null };
        if (funcError) throw funcError;

        return data;
    };

    /**
     * إرسال رسالة مع دعم إعادة المحاولة
     */
    const sendMessageWithRetry = async (
        query: string,
        attempt: number = 1
    ): Promise<ChatResponse | null> => {
        // إنشاء AbortController جديد
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            // تحديث حالة إعادة المحاولة
            if (attempt > 1) {
                setRetryState({
                    attempt,
                    maxAttempts: MAX_RETRY_ATTEMPTS,
                    isRetrying: true
                });
            }

            // جلب الجلسة
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw { message: 'يجب تسجيل الدخول لاستخدام نبض AI', context: { status: 401 } };
            }

            // تحضير السياق (آخر 5 رسائل) بالصيغة التي يتوقعها Edge Function
            const history = messages.slice(-5).map(m => ({
                role: m.role === 'model' ? 'assistant' : 'user',
                content: m.content
            }));

            const startTime = performance.now();

            // استدعاء API
            const response = await invokeWithTimeout(query, history, session.access_token, signal);

            const responseTime = Math.round(performance.now() - startTime);

            // إضافة رد المساعد مع وقت الاستجابة
            setMessages(prev => [...prev, {
                role: 'model',
                content: response.answer,
                timestamp: Date.now(),
                status: 'sent',
                responseTime
            }]);

            // إعادة تعيين حالة إعادة المحاولة
            setRetryState({ attempt: 0, maxAttempts: MAX_RETRY_ATTEMPTS, isRetrying: false });
            setError(null);

            return response;

        } catch (err: unknown) {
            console.error(`Chat error (attempt ${attempt}/${MAX_RETRY_ATTEMPTS}):`, err);

            const classifiedError = classifyError(err);

            // إذا كان الخطأ قابل لإعادة المحاولة ولم نصل للحد الأقصى
            if (classifiedError.retryable && attempt < MAX_RETRY_ATTEMPTS) {
                console.log(`Retrying in ${BASE_RETRY_DELAY * Math.pow(2, attempt - 1)}ms...`);
                await delay(attempt);
                return sendMessageWithRetry(query, attempt + 1);
            }

            // تحديث حالة الخطأ
            setError(classifiedError);

            // تحديث حالة الرسالة الأخيرة (المستخدم) لتصبح خطأ
            setMessages(prev => {
                const updated = [...prev];
                const lastUserIndex = updated.findLastIndex(m => m.role === 'user');
                if (lastUserIndex >= 0) {
                    updated[lastUserIndex] = { ...updated[lastUserIndex], status: 'error' };
                }
                return updated;
            });

            setRetryState({ attempt: 0, maxAttempts: MAX_RETRY_ATTEMPTS, isRetrying: false });
            return null;
        }
    };

    /**
     * معالجة قائمة انتظار الرسائل
     */
    const processQueue = useCallback(async () => {
        if (isProcessingRef.current || messageQueueRef.current.length === 0) {
            return;
        }

        isProcessingRef.current = true;

        while (messageQueueRef.current.length > 0) {
            const query = messageQueueRef.current.shift()!;
            await sendMessageWithRetry(query);
        }

        isProcessingRef.current = false;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);

    /**
     * إرسال رسالة جديدة
     */
    const sendMessage = useCallback(async (query: string): Promise<ChatResponse | null> => {
        if (!query.trim()) return null;

        // إذا كان هناك طلب قيد التنفيذ، أضف للقائمة
        if (isLoading) {
            messageQueueRef.current.push(query);
            return null;
        }

        setIsLoading(true);
        setError(null);

        // إضافة رسالة المستخدم فوراً
        const userMessage: ChatMessage = {
            role: 'user',
            content: query,
            timestamp: Date.now(),
            status: 'sending'
        };
        setMessages(prev => [...prev, userMessage]);

        try {
            const result = await sendMessageWithRetry(query);

            // تحديث حالة رسالة المستخدم
            setMessages(prev => {
                const updated = [...prev];
                const lastUserIndex = updated.findLastIndex(m => m.role === 'user');
                if (lastUserIndex >= 0 && updated[lastUserIndex].status === 'sending') {
                    updated[lastUserIndex] = { ...updated[lastUserIndex], status: 'sent' };
                }
                return updated;
            });

            // معالجة القائمة إن وجدت
            if (messageQueueRef.current.length > 0) {
                setTimeout(processQueue, 100);
            }

            return result;
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, processQueue]);

    /**
     * إعادة إرسال آخر رسالة فشلت
     */
    const retryLastMessage = useCallback(async () => {
        const lastUserMessage = [...messages].reverse().find(m => m.role === 'user' && m.status === 'error');
        if (lastUserMessage) {
            // حذف الرسالة الفاشلة أولاً
            setMessages(prev => prev.filter(m => m !== lastUserMessage));
            // إعادة الإرسال
            await sendMessage(lastUserMessage.content);
        }
    }, [messages, sendMessage]);

    /**
     * مسح المحادثة
     */
    const clearChat = useCallback(() => {
        cancelRequest();
        setMessages([]);
        setError(null);
        messageQueueRef.current = [];
        setRetryState({ attempt: 0, maxAttempts: MAX_RETRY_ATTEMPTS, isRetrying: false });
    }, [cancelRequest]);

    return {
        // الحالة
        messages,
        setMessages,
        isLoading,
        error,
        retryState,

        // الإجراءات
        sendMessage,
        clearChat,
        cancelRequest,
        retryLastMessage
    };
};
