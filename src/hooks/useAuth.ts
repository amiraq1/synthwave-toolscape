import { useCallback, useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

const RETURN_TO_KEY = "nabd_return_to";

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  const mountedRef = useRef(false);
  const resolvedOnceRef = useRef(false);

  const safelySetAuth = useCallback((session: Session | null | undefined) => {
    if (!mountedRef.current) return;

    const validSession = session ?? null;
    setState({
      session: validSession,
      user: validSession?.user ?? null,
      loading: false,
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    resolvedOnceRef.current = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // بعض المشاريع يصلها INITIAL_SESSION مباشرة
      // نخلي "أول نتيجة" تحسم
      if (!resolvedOnceRef.current) {
        resolvedOnceRef.current = true;
        safelySetAuth(session);
        return;
      }

      // بعد الحسم الأول: أي تغيير فعلي نحدّثه
      if (event !== "INITIAL_SESSION") {
        safelySetAuth(session);
      }
    });

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mountedRef.current) return;

      if (!resolvedOnceRef.current) {
        resolvedOnceRef.current = true;
        if (error) {
          safelySetAuth(null);
        } else {
          safelySetAuth(data.session ?? null);
        }
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
    // خزّن صفحة الرجوع (بدون hash) — أفضل للموبايل
    try {
      const url = new URL(window.location.href);
      url.hash = "";
      sessionStorage.setItem(RETURN_TO_KEY, url.toString());
    } catch {
      // ignore
    }

    const redirectTo = `${window.location.origin}/auth/callback`;

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

// ملاحظة: أنشئ Route بسيط /auth/callback يقرأ RETURN_TO_KEY ويعمل navigate له بعد ما يلتقط Supabase الجلسة.
