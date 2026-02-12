import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdminCheck = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const resolveAdminStatus = async (userId: string): Promise<boolean> => {
      // 1) Preferred path: dedicated helper
      try {
        const { data, error } = await supabase.rpc('is_admin');
        if (!error && data === true) return true;
      } catch {
        // Continue to fallback checks.
      }

      // 2) Fallback: current user role helper
      try {
        const { data, error } = await supabase.rpc('get_my_role');
        if (!error && data === 'admin') return true;
      } catch {
        // Continue to fallback checks.
      }

      // 3) Legacy fallback: has_role(user_id, role)
      try {
        const { data, error } = await supabase.rpc('has_role', {
          _user_id: userId,
          _role: 'admin'
        });
        if (!error && data === true) return true;
      } catch {
        // Continue to fallback checks.
      }

      // 4) Direct self-read fallback (allowed by "own role" policies in many setups)
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data?.role === 'admin') return true;
      } catch {
        // Final fallback: false.
      }

      return false;
    };

    const checkAdminRole = async () => {
      if (!user) {
        if (!cancelled) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      try {
        const admin = await resolveAdminStatus(user.id);
        if (!cancelled) {
          setIsAdmin(admin);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('Error checking admin role:', err);
        }
        if (!cancelled) {
          setIsAdmin(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (!authLoading) {
      checkAdminRole();
    }

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { isAdmin, loading: loading || authLoading };
};
