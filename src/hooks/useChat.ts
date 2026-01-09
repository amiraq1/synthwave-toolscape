import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface ChatResponse {
    answer: string;
    tools: unknown[];
}

export const useChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendMessage = async (query: string) => {
        try {
            setIsLoading(true);
            setError(null);

            // Add user message immediately
            const newMessages = [...messages, { role: 'user', content: query } as ChatMessage];
            setMessages(newMessages);

            // Prepare history for context (optional, limiting to last few messages)
            const history = messages.slice(-5).map(m => ({
                role: m.role,
                parts: m.content
            }));

            // Get current session to pass auth token
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setError('يجب تسجيل الدخول لاستخدام نبض AI');
                // Remove the user message we just added
                setMessages(messages);
                return null;
            }

            const { data, error: funcError } = await supabase.functions.invoke('chat', {
                body: { query, history },
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });

            if (funcError) throw funcError;

            const response = data as ChatResponse;

            // Add model response
            setMessages(prev => [...prev, { role: 'model', content: response.answer }]);

            return response;

        } catch (err: unknown) {
            console.error('Chat error:', err);

            // تحسين رسالة الخطأ للمستخدم
            let errorMessage = 'حدث خطأ أثناء المحادثة';

            const error = err as { context?: { status?: number }; message?: string } | null;
            if (error?.context?.status === 401 || error?.message?.includes('401') || error?.message?.includes('تسجيل الدخول')) {
                errorMessage = 'يجب تسجيل الدخول لاستخدام نبض AI';
            } else if (error?.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([]);
        setError(null);
    };

    return {
        messages,
        setMessages,
        sendMessage,
        clearChat,
        isLoading,
        error
    };
};
