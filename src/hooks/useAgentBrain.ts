/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🧠 useAgentBrain - Hook للتواصل مع عقل الوكيل
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * يوفر واجهة React للتفاعل مع Agent Brain Edge Function
 * مع دعم:
 * - إدارة الحالة والأخطاء
 * - إعادة المحاولة التلقائية
 * - تتبع الأدوات المنفذة
 * - حفظ المحادثة
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ─────────────────────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentMessage {
    id: string;
    role: 'user' | 'agent';
    content: string;
    timestamp: number;
    status: 'sending' | 'sent' | 'error';
    toolsExecuted?: ToolExecution[];
    executionTime?: number;
    agentInfo?: AgentInfo;
}

export interface AgentInfo {
    slug: string;
    name: string;
    emoji: string;
}

export interface ToolExecution {
    name: string;
    success: boolean;
    itemsFound: number;
}

export interface AgentResponse {
    reply: string;
    answer: string;
    agent?: AgentInfo;
    toolsExecuted: ToolExecution[];
    executionTime: number;
    rateLimit: {
        remaining: number;
        resetIn: number;
    };
}

// وكلاء متاحون
export type AgentSlug = 'general' | 'coder' | 'designer' | 'writer' | 'video';

export type AgentErrorType = 'auth' | 'network' | 'server' | 'timeout' | 'rateLimit' | 'cancelled' | 'unknown';

export interface AgentError {
    type: AgentErrorType;
    message: string;
    retryable: boolean;
    retryAfter?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MAX_RETRY_ATTEMPTS = 3;
const BASE_RETRY_DELAY = 1000;
const REQUEST_TIMEOUT = 45000; // 45 ثانية للوكيل (أطول من chat العادي)
const STORAGE_KEY = 'nabd_agent_history';
const MAX_STORED_MESSAGES = 50;

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────────────────────

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const classifyError = (err: unknown): AgentError => {
    const error = err as {
        context?: { status?: number };
        message?: string;
        name?: string;
        retryAfter?: number;
    } | null;

    if (error?.name === 'AbortError') {
        return { type: 'cancelled', message: 'تم إلغاء الطلب', retryable: false };
    }

    if (error?.context?.status === 429) {
        return {
            type: 'rateLimit',
            message: 'تجاوزت الحد المسموح. انتظر قليلاً ⏳',
            retryable: true,
            retryAfter: error.retryAfter || 60
        };
    }

    if (error?.context?.status === 401 || error?.message?.includes('401')) {
        return { type: 'auth', message: 'يجب تسجيل الدخول 🔐', retryable: false };
    }

    if (error?.message?.includes('network') || error?.message?.includes('Failed to fetch') || !navigator.onLine) {
        return { type: 'network', message: 'خطأ في الاتصال 📡', retryable: true };
    }

    if (error?.context?.status && error.context.status >= 500) {
        return { type: 'server', message: 'خطأ في الخادم ⚠️', retryable: true };
    }

    if (error?.message?.includes('timeout') || error?.name === 'TimeoutError') {
        return { type: 'timeout', message: 'انتهت مهلة الطلب ⏰', retryable: true };
    }

    return { type: 'unknown', message: error?.message || 'حدث خطأ غير متوقع', retryable: true };
};

const delay = (attempt: number): Promise<void> => {
    const ms = BASE_RETRY_DELAY * Math.pow(2, attempt - 1);
    return new Promise(resolve => setTimeout(resolve, ms));
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Hook
// ─────────────────────────────────────────────────────────────────────────────

export const useAgentBrain = (initialAgentSlug: AgentSlug = 'general') => {
    const [messages, setMessages] = useState<AgentMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [error, setError] = useState<AgentError | null>(null);
    const [rateLimit, setRateLimit] = useState<{ remaining: number; resetIn: number } | null>(null);
    const [currentAgent, setCurrentAgent] = useState<AgentSlug>(initialAgentSlug);

    const abortControllerRef = useRef<AbortController | null>(null);
    const isProcessingRef = useRef(false);

    // تحميل المحادثة المحفوظة
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as AgentMessage[];
                // تحميل فقط الرسائل الناجحة
                const validMessages = parsed.filter(m => m.status === 'sent');
                setMessages(validMessages.slice(-MAX_STORED_MESSAGES));
            }
        } catch (e) {
            console.warn('Failed to load agent history:', e);
        }
    }, []);

    // حفظ المحادثة
    useEffect(() => {
        if (messages.length > 0) {
            try {
                const toStore = messages
                    .filter(m => m.status === 'sent')
                    .slice(-MAX_STORED_MESSAGES);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
            } catch (e) {
                console.warn('Failed to save agent history:', e);
            }
        }
    }, [messages]);

    /**
     * إلغاء الطلب الحالي
     */
    const cancelRequest = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
            setIsThinking(false);
        }
    }, []);

    /**
     * استدعاء Agent Brain مع timeout
     */
    const invokeAgentBrain = async (
        query: string,
        history: { role: string; content: string }[],
        accessToken: string,
        signal: AbortSignal,
        agentSlug: AgentSlug
    ): Promise<AgentResponse> => {
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('timeout')), REQUEST_TIMEOUT);
        });

        const fetchPromise = supabase.functions.invoke('agent-brain', {
            body: { query, history, agentSlug },
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const result = await Promise.race([fetchPromise, timeoutPromise]);

        if (signal.aborted) {
            throw new Error('AbortError');
        }

        const { data, error: funcError } = result as { data: AgentResponse; error: Error | null };
        if (funcError) throw funcError;

        return data;
    };

    /**
     * إرسال رسالة مع إعادة المحاولة
     */
    const sendMessageWithRetry = async (query: string, attempt: number = 1): Promise<AgentResponse | null> => {
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            if (attempt > 1) {
                setIsThinking(true);
            }

            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw { message: 'يجب تسجيل الدخول', context: { status: 401 } };
            }

            const history = messages.slice(-6).map(m => ({
                role: m.role === 'agent' ? 'assistant' : 'user',
                content: m.content
            }));

            const startTime = performance.now();
            setIsThinking(true);

            const response = await invokeAgentBrain(query, history, session.access_token, signal, currentAgent);
            const clientExecutionTime = Math.round(performance.now() - startTime);

            // تحديث Rate Limit
            if (response.rateLimit) {
                setRateLimit(response.rateLimit);
            }

            // إضافة رد الوكيل
            setMessages(prev => [...prev, {
                id: generateId(),
                role: 'agent',
                content: response.reply || response.answer,
                timestamp: Date.now(),
                status: 'sent',
                toolsExecuted: response.toolsExecuted,
                executionTime: response.executionTime || clientExecutionTime,
                agentInfo: response.agent
            }]);

            setError(null);
            setIsThinking(false);

            return response;

        } catch (err: unknown) {
            console.error(`Agent Brain error (attempt ${attempt}/${MAX_RETRY_ATTEMPTS}):`, err);

            const classifiedError = classifyError(err);

            if (classifiedError.retryable && attempt < MAX_RETRY_ATTEMPTS) {
                console.log(`Retrying in ${BASE_RETRY_DELAY * Math.pow(2, attempt - 1)}ms...`);
                await delay(attempt);
                return sendMessageWithRetry(query, attempt + 1);
            }

            setError(classifiedError);

            // تحديث حالة الرسالة الأخيرة
            setMessages(prev => {
                const updated = [...prev];
                const lastUserIndex = updated.findLastIndex(m => m.role === 'user');
                if (lastUserIndex >= 0) {
                    updated[lastUserIndex] = { ...updated[lastUserIndex], status: 'error' };
                }
                return updated;
            });

            setIsThinking(false);
            return null;
        }
    };

    /**
     * إرسال رسالة جديدة
     */
    const sendMessage = useCallback(async (query: string): Promise<AgentResponse | null> => {
        if (!query.trim() || isProcessingRef.current) return null;

        isProcessingRef.current = true;
        setIsLoading(true);
        setError(null);

        // إضافة رسالة المستخدم
        const userMessage: AgentMessage = {
            id: generateId(),
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

            return result;
        } finally {
            setIsLoading(false);
            isProcessingRef.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);

    /**
     * إعادة إرسال آخر رسالة فشلت
     */
    const retryLastMessage = useCallback(async () => {
        const lastFailedMessage = [...messages].reverse().find(m => m.role === 'user' && m.status === 'error');
        if (lastFailedMessage) {
            setMessages(prev => prev.filter(m => m.id !== lastFailedMessage.id));
            await sendMessage(lastFailedMessage.content);
        }
    }, [messages, sendMessage]);

    /**
     * مسح المحادثة
     */
    const clearChat = useCallback(() => {
        cancelRequest();
        setMessages([]);
        setError(null);
        setRateLimit(null);
        localStorage.removeItem(STORAGE_KEY);
    }, [cancelRequest]);

    /**
     * تغيير الوكيل الحالي
     */
    const switchAgent = useCallback((agentSlug: AgentSlug) => {
        setCurrentAgent(agentSlug);
    }, []);

    /**
     * جلب اقتراحات سريعة حسب الوكيل
     */
    const getQuickSuggestions = useCallback(() => {
        const suggestions: Record<AgentSlug, string[]> = {
            general: [
                "🔍 ابحث عن أدوات لتحرير الفيديو",
                "📊 قارن بين ChatGPT و Claude",
                "✍️ أفضل أدوات كتابة المحتوى",
                "🎨 أدوات تصميم بالذكاء الاصطناعي"
            ],
            coder: [
                "💻 أفضل مساعد برمجة AI",
                "⚖️ قارن بين Copilot و Cursor",
                "🔧 أدوات مراجعة الكود",
                "🚀 أدوات توليد الكود المجانية"
            ],
            designer: [
                "🎨 أفضل مولدات الصور AI",
                "⚖️ قارن بين Midjourney و DALL-E",
                "🖼️ أدوات تحسين الصور",
                "✨ أدوات تصميم الواجهات"
            ],
            writer: [
                "✍️ أفضل كاتب محتوى AI",
                "⚖️ قارن بين Jasper و Copy.ai",
                "📝 أدوات تدقيق النصوص",
                "📈 أدوات SEO بالذكاء الاصطناعي"
            ],
            video: [
                "🎬 أفضل مولد فيديو AI",
                "⚖️ قارن بين Runway و Pika",
                "🎤 أدوات الأفاتار الذكية",
                "✏️ أدوات مونتاج الفيديو"
            ]
        };
        return suggestions[currentAgent];
    }, [currentAgent]);

    // قائمة الوكلاء المتاحين
    const availableAgents: { slug: AgentSlug; name: string; emoji: string; description: string }[] = [
        { slug: 'general', name: 'المساعد العام', emoji: '🤖', description: 'مساعدك الذكي للعثور على أي أداة' },
        { slug: 'coder', name: 'خبير الكود', emoji: '💻', description: 'متخصص في أدوات البرمجة' },
        { slug: 'designer', name: 'مستشار التصميم', emoji: '🎨', description: 'خبير في أدوات التصميم' },
        { slug: 'writer', name: 'كاتب المحتوى', emoji: '✍️', description: 'متخصص في أدوات الكتابة' },
        { slug: 'video', name: 'خبير الفيديو', emoji: '🎬', description: 'متخصص في أدوات الفيديو' }
    ];

    return {
        // الحالة
        messages,
        setMessages,
        isLoading,
        isThinking,
        error,
        rateLimit,
        currentAgent,

        // الإجراءات
        sendMessage,
        clearChat,
        cancelRequest,
        retryLastMessage,
        switchAgent,

        // إضافات
        quickSuggestions: getQuickSuggestions(),
        availableAgents
    };
};

export default useAgentBrain;
