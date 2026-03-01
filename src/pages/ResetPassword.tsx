import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const createPasswordSchema = () => z
  .object({
    password: z.string().min(6, "ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ظٹط¬ط¨ ط£ظ† طھظƒظˆظ† 6 ط£ط­ط±ظپ ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "ظƒظ„ظ…طھط§ ط§ظ„ظ…ط±ظˆط± ط؛ظٹط± ظ…طھط·ط§ط¨ظ‚طھظٹظ†",
    path: ["confirmPassword"],
  });

function parseAuthParams() {
  const url = new URL(window.location.href);

  // 1) Supabase ظ‚ط¯ ظٹط±ط³ظ„ code ظپظٹ query (PKCE)
  const code = url.searchParams.get("code");

  // 2) ط£ظˆ ظٹط±ط³ظ„ access_token ظپظٹ hash
  const hash = url.hash?.startsWith("#") ? url.hash.substring(1) : url.hash;
  const hashParams = new URLSearchParams(hash || "");
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  const type = hashParams.get("type"); // recovery / signup / magiclink ... ط¥ظ„ط®

  return { code, accessToken, refreshToken, type };
}

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const params = useMemo(() => parseAuthParams(), []);

  useEffect(() => {
    let cancelled = false;

    const validateAndBootstrapSession = async () => {
      try {
        // ظ„ظˆ ط¹ظ†ط¯ظ†ط§ code (PKCE) -> exchangeCodeForSession
        if (params.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(params.code);
          if (error) {
            toast.error("ط±ط§ط¨ط· ط؛ظٹط± طµط§ظ„ط­", {
              description: "ظٹط±ط¬ظ‰ ط·ظ„ط¨ ط±ط§ط¨ط· ط¬ط¯ظٹط¯ ظ„ط¥ط¹ط§ط¯ط© طھط¹ظٹظٹظ† ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±",
            });
            navigate("/auth", { replace: true });
            return;
          }
        }

        // ظ„ظˆ ط¹ظ†ط¯ظ†ط§ access_token ظپظٹ hashطŒ Supabase ط؛ط§ظ„ط¨ظ‹ط§ ظٹظ„طھظ‚ط·ظ‡ طھظ„ظ‚ط§ط¦ظٹظ‹ط§
        // ظ„ظƒظ† ظ†طھط£ظƒط¯ ط£ظ† ط¹ظ†ط¯ظ†ط§ session ظپط¹ظ„ط§ظ‹
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          toast.error("ط±ط§ط¨ط· ط؛ظٹط± طµط§ظ„ط­", {
            description: "ظٹط±ط¬ظ‰ ط·ظ„ط¨ ط±ط§ط¨ط· ط¬ط¯ظٹط¯ ظ„ط¥ط¹ط§ط¯ط© طھط¹ظٹظٹظ† ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±",
          });
          navigate("/auth", { replace: true });
          return;
        }

        // ظ…ظ„ط§ط­ط¸ط©: ط¥ط°ط§ type ظ…ظˆط¬ظˆط¯ ظˆظ„ظٹط³ recovery ظ‚ط¯ طھط­ط¨ طھظ…ظ†ط¹
        // ظ„ظƒظ† ظ†ط®ظ„ظٹظ‡ ظ…ط±ظ† ط§ظ„ط¢ظ†.
      } finally {
        if (!cancelled) setIsCheckingLink(false);
      }
    };

    validateAndBootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [navigate, params.code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = createPasswordSchema().safeParse({ password, confirmPassword });
      if (!validation.success) {
        toast.error("ط®ط·ط£ ظپظٹ ط§ظ„طھط­ظ‚ظ‚", {
          description: validation.error.errors[0].message,
        });
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("ط§ظ†طھظ‡طھ طµظ„ط§ط­ظٹط© ط§ظ„ط±ط§ط¨ط·", {
          description: "ظٹط±ط¬ظ‰ ط·ظ„ط¨ ط±ط§ط¨ط· ط¬ط¯ظٹط¯ ظ„ط¥ط¹ط§ط¯ط© طھط¹ظٹظٹظ† ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±",
        });
        navigate("/auth", { replace: true });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error("ط®ط·ط£", {
          description: "ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±",
        });
        return;
      }

      setIsSuccess(true);
      toast.success("طھظ… ط¨ظ†ط¬ط§ط­!", {
        description: "طھظ… طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط¨ظ†ط¬ط§ط­",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ط´ط§ط´ط© طھط­ظ…ظٹظ„ ط¨ط³ظٹط·ط© ط£ط«ظ†ط§ط، ظپط­طµ ط§ظ„ط±ط§ط¨ط· (ط£ظپط¶ظ„ UX ظ„ظ„ظ…ظˆط¨ط§ظٹظ„)
  if (isCheckingLink) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4" dir="rtl" role="main">
        <div className="w-full max-w-md">
          <div className="glass rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <Activity className="mx-auto h-10 w-10 text-neon-purple animate-pulse" />
            <p className="text-muted-foreground">ط¬ط§ط±ظچ ط§ظ„طھط­ظ‚ظ‚ ظ…ظ† ط±ط§ط¨ط· ط¥ط¹ط§ط¯ط© ط§ظ„طھط¹ظٹظٹظ†...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6" dir="rtl" role="main">
        <div className="fixed top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
        <div className="fixed bottom-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-neon-blue/20 rounded-full blur-[120px] -z-10" />

        <div className="w-full max-w-md">
          <div className="glass rounded-3xl p-6 sm:p-8 space-y-8 text-center">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">طھظ… طھط؛ظٹظٹط± ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±</h1>
              <p className="text-muted-foreground">ظٹظ…ظƒظ†ظƒ ط§ظ„ط¢ظ† طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„ ط¨ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط¬ط¯ظٹط¯ط©</p>
            </div>

            <Button
              onClick={() => navigate("/auth", { replace: true })}
              className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity py-6 text-lg"
            >
              طھط³ط¬ظٹظ„ ط§ظ„ط¯ط®ظˆظ„
            </Button>

            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ط§ظ„ط¹ظˆط¯ط© ظ„ظ„ط±ط¦ظٹط³ظٹط©
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6" dir="rtl" role="main">
      <div className="fixed top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-neon-blue/20 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Activity className="h-10 w-10 text-neon-purple animate-pulse" />
              <h1 className="text-3xl">
                <span className="font-extrabold gradient-text">نبض</span>
                <span className="font-medium text-foreground/80 ml-1">AI</span>
              </h1>
            </div>
            <p className="text-muted-foreground">ط£ظ†ط´ط¦ ظƒظ„ظ…ط© ظ…ط±ظˆط± ط¬ط¯ظٹط¯ط©</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط± ط§ظ„ط¬ط¯ظٹط¯ط©</Label>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground right-3" />
                <Input
                  id="password"
                  type="password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted/50 border-border/50 pr-10"
                  dir="ltr"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">طھط£ظƒظٹط¯ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±</Label>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground right-3" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-muted/50 border-border/50 pr-10"
                  dir="ltr"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity py-6 text-lg"
            >
              {isLoading ? "ط¬ط§ط±ظچ ط§ظ„ط­ظپط¸..." : "ط­ظپط¸ ظƒظ„ظ…ط© ط§ظ„ظ…ط±ظˆط±"}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ط§ظ„ط¹ظˆط¯ط© ظ„ظ„ط±ط¦ظٹط³ظٹط©
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

