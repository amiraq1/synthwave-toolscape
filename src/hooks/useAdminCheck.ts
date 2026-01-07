import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdminCheck = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // 1. Check new profiles table (Preferred)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        // 2. Fallback to old has_role RPC (Legacy)
        // داخل useEffect أو useAuth، تحقق من: session.user.role === 'admin'
        // للتبسيط الآن، سنبقي الحماية القديمة مؤقتاً أو نحدثها لاحقاً
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });

        if (error) {
          if (import.meta.env.DEV) {
            console.error('Error checking admin role:', error);
          }
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Error checking admin role:', err);
        }
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAdminRole();
    }
  }, [user, authLoading]);

  return { isAdmin, loading: loading || authLoading };
};
