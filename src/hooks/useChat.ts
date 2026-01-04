import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface ChatResponse {
    answer: string;
    tools: any[];
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

            const { data, error: funcError } = await supabase.functions.invoke('chat', {
                body: { query, history }
            });

            if (funcError) throw funcError;

            const response = data as ChatResponse;

            // Add model response
            setMessages(prev => [...prev, { role: 'model', content: response.answer }]);

            return response;

        } catch (err: any) {
            console.error('Chat error:', err);
            
            // تحسين رسالة الخطأ للمستخدم
            let errorMessage = 'حدث خطأ أثناء المحادثة';
            
            if (err?.context?.status === 401 || err?.message?.includes('401') || err?.message?.includes('تسجيل الدخول')) {
                errorMessage = 'يجب تسجيل الدخول لاستخدام نبض AI';
            } else if (err?.message) {
                errorMessage = err.message;
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
        sendMessage,
        clearChat,
        isLoading,
        error
    };
};
