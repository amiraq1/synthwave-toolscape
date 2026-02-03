import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageLoader from "@/components/PageLoader";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const finalizeAuth = async () => {
      try {
        const url = new URL(window.location.href);
        const errorDescription =
          url.searchParams.get("error_description") || url.searchParams.get("error");

        if (errorDescription) {
          throw new Error(errorDescription);
        }

        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          await supabase.auth.getSession();
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "تعذّر إكمال تسجيل الدخول");
        }
        return;
      }

      if (!isMounted) return;

      const params = new URLSearchParams(location.search);
      const from = params.get("from") || "/";
      navigate(from, { replace: true });
    };

    void finalizeAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate, location.search]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6" dir="rtl">
        <h1 className="text-2xl font-bold mb-3">فشل تسجيل الدخول</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => navigate("/auth")} className="bg-neon-purple hover:bg-neon-purple/80">
          العودة لصفحة الدخول
        </Button>
      </div>
    );
  }

  return <PageLoader />;
};

export default AuthCallback;
