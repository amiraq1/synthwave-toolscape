import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { type Session, type User, type AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInWithGoogle: () => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<{ error: AuthError | null }>;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthState>({
    user: null,
    session: null,
    loading: true,
    signInWithGoogle: async () => ({ error: null }),
    signOut: async () => ({ error: null }),
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
        }).catch((error) => {
            console.error("Auth session error:", error);
        }).finally(() => {
            setLoading(false);
        });

        // 2. Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        return { error };
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signUp = async (email: string, password: string, displayName?: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { display_name: displayName }
            }
        });
        return { error };
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut, signIn, signUp }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
