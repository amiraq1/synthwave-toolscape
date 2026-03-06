import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { ArrowRight, CircuitBoard, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EditorialPage } from "@/components/layout/EditorialPage";

const getAuthErrorMessage = (message: string | undefined, t: (key: string) => string) => {
  if (!message) return t("auth.try_later");

  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return t("auth.invalid_credentials");
  }

  if (normalized.includes("email not confirmed")) {
    return t("auth.email_not_confirmed");
  }

  if (normalized.includes("email address") && normalized.includes("invalid")) {
    return t("auth.invalid_email");
  }

  if (normalized.includes("email rate limit exceeded") || normalized.includes("over_email_send_rate_limit")) {
    return t("auth.email_rate_limit");
  }

  if (normalized.includes("provider is not enabled") || normalized.includes("unsupported provider")) {
    return t("auth.google_unavailable");
  }

  return message;
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const isGoogleAuthEnabled = import.meta.env.VITE_ENABLE_GOOGLE_AUTH === "true";

  const from = searchParams.get("from") || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) throw error;
        toast.success(t("auth.login_success"));
        navigate(from);
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) throw error;
        toast.success(t("auth.signup_success"));
        setIsLogin(true);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : undefined;
      toast.error(t("auth.error"), {
        description: getAuthErrorMessage(message, t),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : undefined;
      toast.error(t("auth.error"), {
        description: getAuthErrorMessage(message, t),
      });
      setLoading(false);
    }
  };

  return (
    <EditorialPage className="flex items-center">
      <Helmet>
        <title>{isLogin ? t("auth.login") : t("auth.signup")} | نبض AI</title>
      </Helmet>

      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="editorial-ink-panel flex flex-col justify-between p-6 sm:p-8">
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">AUTH</span>
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white/10">
              <CircuitBoard className="h-8 w-8" />
            </div>
            <h1 className="font-editorial text-4xl font-semibold leading-tight">
              {isLogin ? t("auth.welcome_back") : t("auth.join")}
            </h1>
            <p className="text-sm leading-7 text-white/70">
              {isLogin ? t("auth.login_subtitle") : t("auth.signup_subtitle")}
            </p>
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">NABD AI</p>
            <p className="mt-3 text-sm leading-7 text-white/70">
              تسجيل الدخول يفتح لك الحفظ، المقارنة، وإرسال الأدوات الجديدة. وإذا كنت صاحب الحساب الإداري فستظهر لك المساحات الخاصة بالإدارة والمالك.
            </p>
          </div>
        </div>

        <div className="editorial-paper p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-900">{t("auth.fullname")}</Label>
                <div className="relative">
                  <Input
                    id="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder={t("auth.fullname_placeholder")}
                    className="h-12 rounded-2xl border-black/10 bg-white/80 pr-11 text-right"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                  <Sparkles className="absolute right-4 top-4 h-4 w-4 text-slate-400" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-900">{t("auth.email")}</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="h-12 rounded-2xl border-black/10 bg-white/80 pr-11 text-right"
                  dir="ltr"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Mail className="absolute right-4 top-4 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-900">{t("auth.password")}</Label>
                {isLogin && (
                  <Button variant="link" className="h-auto p-0 text-xs text-teal-800 hover:text-teal-700" type="button" onClick={() => navigate("/reset-password")}>
                    {t("auth.forgot_password")}
                  </Button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder="••••••••"
                  className="h-12 rounded-2xl border-black/10 bg-white/80 pr-11 text-right"
                  dir="ltr"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <Lock className="absolute right-4 top-4 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-full bg-slate-950 text-white hover:bg-slate-800"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? t("auth.login") : t("auth.signup")}
                  <ArrowRight className="ms-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          {isGoogleAuthEnabled && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-black/8" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="rounded-full border border-black/8 bg-[#f6f0e5] px-3 py-1 text-slate-500">{t("auth.or_continue")}</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-full border-black/10 bg-white/80 text-slate-950 hover:bg-white"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="me-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {t("auth.google_login")}
              </Button>
            </>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">
              {isLogin ? t("auth.no_account") : t("auth.has_account")}
            </span>{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-teal-800 transition-colors hover:text-teal-700"
            >
              {isLogin ? t("auth.create_now") : t("auth.login")}
            </button>
          </div>
        </div>
      </div>
    </EditorialPage>
  );
};

export default Auth;
