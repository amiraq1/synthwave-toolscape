import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useTranslation } from "react-i18next";

const createPasswordSchema = (isAr: boolean) => z
  .object({
    password: z.string().min(6, isAr ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: isAr ? "كلمتا المرور غير متطابقتين" : "Passwords do not match",
    path: ["confirmPassword"],
  });

function parseAuthParams() {
  const url = new URL(window.location.href);

  // 1) Supabase قد يرسل code في query (PKCE)
  const code = url.searchParams.get("code");

  // 2) أو يرسل access_token في hash
  const hash = url.hash?.startsWith("#") ? url.hash.substring(1) : url.hash;
  const hashParams = new URLSearchParams(hash || "");
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  const type = hashParams.get("type"); // recovery / signup / magiclink ... إلخ

  return { code, accessToken, refreshToken, type };
}

const ResetPassword = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
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
        // لو عندنا code (PKCE) -> exchangeCodeForSession
        if (params.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(params.code);
          if (error) {
            toast.error(isAr ? "رابط غير صالح" : "Invalid link", {
              description: isAr ? "يرجى طلب رابط جديد لإعادة تعيين كلمة المرور" : "Please request a new password reset link",
            });
            navigate("/auth", { replace: true });
            return;
          }
        }

        // لو عندنا access_token في hash، Supabase غالبًا يلتقطه تلقائيًا
        // لكن نتأكد أن عندنا session فعلاً
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          toast.error(isAr ? "رابط غير صالح" : "Invalid link", {
            description: isAr ? "يرجى طلب رابط جديد لإعادة تعيين كلمة المرور" : "Please request a new password reset link",
          });
          navigate("/auth", { replace: true });
          return;
        }

        // ملاحظة: إذا type موجود وليس recovery قد تحب تمنع
        // لكن نخليه مرن الآن.
      } finally {
        if (!cancelled) setIsCheckingLink(false);
      }
    };

    validateAndBootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [navigate, params.code, isAr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = createPasswordSchema(isAr).safeParse({ password, confirmPassword });
      if (!validation.success) {
        toast.error(isAr ? "خطأ في التحقق" : "Validation error", {
          description: validation.error.errors[0].message,
        });
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error(isAr ? "انتهت صلاحية الرابط" : "Link expired", {
          description: isAr ? "يرجى طلب رابط جديد لإعادة تعيين كلمة المرور" : "Please request a new password reset link",
        });
        navigate("/auth", { replace: true });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(isAr ? "خطأ" : "Error", {
          description: isAr ? "حدث خطأ أثناء تغيير كلمة المرور" : "An error occurred while changing password",
        });
        return;
      }

      setIsSuccess(true);
      toast.success(isAr ? "تم بنجاح!" : "Done!", {
        description: isAr ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // شاشة تحميل بسيطة أثناء فحص الرابط (أفضل UX للموبايل)
  if (isCheckingLink) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4" dir={isAr ? "rtl" : "ltr"} role="main">
        <div className="w-full max-w-md">
          <div className="glass rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <Activity className="mx-auto h-10 w-10 text-neon-purple animate-pulse" />
            <p className="text-muted-foreground">{isAr ? "جارٍ التحقق من رابط إعادة التعيين..." : "Validating your reset link..."}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6" dir={isAr ? "rtl" : "ltr"} role="main">
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
              <h1 className="text-2xl font-bold text-foreground">{isAr ? "تم تغيير كلمة المرور" : "Password Changed"}</h1>
              <p className="text-muted-foreground">{isAr ? "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة" : "You can now sign in with your new password"}</p>
            </div>

            <Button
              onClick={() => navigate("/auth", { replace: true })}
              className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity py-6 text-lg"
            >
              {isAr ? "تسجيل الدخول" : "Sign In"}
            </Button>

            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isAr ? "العودة للرئيسية" : "Back to Home"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6" dir={isAr ? "rtl" : "ltr"} role="main">
      <div className="fixed top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-neon-blue/20 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-md">
        <div className="glass rounded-3xl p-6 sm:p-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Activity className="h-10 w-10 text-neon-purple animate-pulse" />
              <h1 className="text-3xl">
                <span className="font-extrabold gradient-text">Nabd</span>
                <span className="font-medium text-foreground/80 ml-1">AI</span>
              </h1>
            </div>
            <p className="text-muted-foreground">{isAr ? "أنشئ كلمة مرور جديدة" : "Create a new password"}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">{isAr ? "كلمة المرور الجديدة" : "New Password"}</Label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isAr ? "right-3" : "left-3"}`} />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`bg-muted/50 border-border/50 ${isAr ? "pr-10" : "pl-10"}`}
                  dir="ltr"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{isAr ? "تأكيد كلمة المرور" : "Confirm Password"}</Label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground ${isAr ? "right-3" : "left-3"}`} />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`bg-muted/50 border-border/50 ${isAr ? "pr-10" : "pl-10"}`}
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
              {isLoading ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ كلمة المرور" : "Save Password")}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate("/", { replace: true })}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isAr ? "العودة للرئيسية" : "Back to Home"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
