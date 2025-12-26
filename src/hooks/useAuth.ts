import { useCallback, useEffect, useRef, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  // لمنع setState بعد unmount
  const mountedRef = useRef(true);

  // لمنع إنهاء loading مرتين
  const resolvedOnceRef = useRef(false);

  const safelySetAuth = useCallback((session: Session | null | undefined) => {
    if (!mountedRef.current) return;

    const validSession = session ?? null;
    const validUser = validSession?.user ?? null;

    setState({
      session: validSession,
      user: validUser,
      loading: false,
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // 1) Listener أولاً
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // أول حدث يحسم الحالة
      resolvedOnceRef.current = true;
      safelySetAuth(session);
    });

    // 2) بعدها نجيب session الحالي (لو ما وصل حدث قبلها)
    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mountedRef.current) return;

      // إذا ما صار أي event قبلها، اعتمد getSession
      if (!resolvedOnceRef.current) {
        if (error) {
          // فشل الجلب: اعتبرها غير مسجل
          safelySetAuth(null);
          return;
        }
        safelySetAuth(data.session ?? null);
        resolvedOnceRef.current = true;
      }
    })();

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [safelySetAuth]);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { display_name: displayName },
      },
    });

    return { error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    // أفضل UX للموبايل: ارجع لنفس الصفحة الحالية بعد OAuth
    const redirectTo = window.location.href;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    return { error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  return {
    user: state.user,
    session: state.session,
    loading: state.loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };
};
