import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useClickTracking = () => {
    const recordClick = useCallback(async (toolId: number) => {
        try {
            const { error } = await supabase.rpc('record_tool_click', {
                p_tool_id: toolId,
                p_referrer: document.referrer || null,
                p_user_agent: navigator.userAgent || null
            });

            if (error) {
                console.error('Error recording click:', error);
            }
        } catch (err) {
            console.error('Failed to track click:', err);
        }
    }, []);

    return { recordClick };
};
