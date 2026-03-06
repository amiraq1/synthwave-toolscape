import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  EditorialHero,
  EditorialPage,
  EditorialPanel,
} from "@/components/layout/EditorialPage";

function parseAuthParams() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const hash = url.hash?.startsWith("#") ? url.hash.substring(1) : url.hash;
  const hashParams = new URLSearchParams(hash || "");
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");
  const type = hashParams.get("type");

  return { code, accessToken, refreshToken, type };
}

const ResetPassword = () => {
  const { t, i18n } = useTranslation();
  const passwordSchema = useMemo(
    () =>
      z
        .object({
          password: z.string().min(6, t("reset.password_min")),
          confirmPassword: z.string(),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t("reset.password_mismatch"),
          path: ["confirmPassword"],
        }),
    [t],
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const params = useMemo(() => parseAuthParams(), []);

  useEffect(() => {
    let cancelled = false;

    const validateAndBootstrapSession = async () => {
      try {
        if (params.code) {
          const { error } = await supabase.auth.exchangeCodeForSession(
            params.code,
          );
          if (error) {
            toast({
              title: t("reset.invalid_link"),
              description: t("reset.invalid_desc"),
              variant: "destructive",
            });
            navigate("/auth", { replace: true });
            return;
          }
        }

        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          toast({
            title: t("reset.invalid_link"),
            description: t("reset.invalid_desc"),
            variant: "destructive",
          });
          navigate("/auth", { replace: true });
          return;
        }
      } finally {
        if (!cancelled) {
          setIsCheckingLink(false);
        }
      }
    };

    void validateAndBootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [navigate, params.code, t, toast]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const validation = passwordSchema.safeParse({ password, confirmPassword });
      if (!validation.success) {
        toast({
          title: t("reset.data_error"),
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: t("reset.expired_link"),
          description: t("reset.invalid_desc"),
          variant: "destructive",
        });
        navigate("/auth", { replace: true });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({
          title: t("reset.error"),
          description: t("reset.error_desc"),
          variant: "destructive",
        });
        return;
      }

      setIsSuccess(true);
      toast({
        title: t("reset.success"),
        description: t("reset.success_desc"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingLink) {
    return (
      <EditorialPage dir={i18n.dir()}>
        <EditorialPanel className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
          <div className="space-y-4 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-slate-950" />
            <p className="text-sm text-slate-600">{t("reset.checking")}</p>
          </div>
        </EditorialPanel>
      </EditorialPage>
    );
  }

  if (isSuccess) {
    return (
      <EditorialPage dir={i18n.dir()}>
        <EditorialHero
          eyebrow={t("reset.success")}
          title={t("reset.title_success")}
          description={t("reset.desc_success")}
          icon={<CheckCircle className="h-7 w-7" />}
          aside={
            <div className="space-y-5 text-white">
              <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">
                Auth
              </span>
              <h2 className="font-editorial text-3xl font-semibold leading-tight">
                Password Updated
              </h2>
              <p className="text-sm leading-7 text-white/72">
                {t("reset.success_desc")}
              </p>
            </div>
          }
        />

        <EditorialPanel className="max-w-3xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="font-editorial text-2xl font-semibold text-slate-950">
                {t("reset.title_success")}
              </h2>
              <p className="text-sm leading-7 text-slate-600">
                {t("reset.desc_success")}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("/auth", { replace: true })}
                className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
              >
                {t("auth.login")}
              </Button>
              <Button
                onClick={() => navigate("/", { replace: true })}
                variant="outline"
                className="rounded-full border-black/10 bg-white/70 px-6 text-slate-950 hover:bg-white"
              >
                {t("nav.back_home")}
              </Button>
            </div>
          </div>
        </EditorialPanel>
      </EditorialPage>
    );
  }

  return (
    <EditorialPage dir={i18n.dir()}>
      <EditorialHero
        eyebrow={t("reset.subtitle")}
        title={t("reset.new_password")}
        description={t("reset.subtitle")}
        icon={<Lock className="h-7 w-7" />}
        aside={
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">
              Secure Reset
            </span>
            <h2 className="font-editorial text-3xl font-semibold leading-tight">
              {t("reset.save")}
            </h2>
            <p className="text-sm leading-7 text-white/72">
              {t("reset.invalid_desc")}
            </p>
          </div>
        }
      />

      <EditorialPanel className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                {t("reset.new_password")}
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="editorial-form-field rounded-2xl pr-10"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700">
                {t("reset.confirm_password")}
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="editorial-form-field rounded-2xl pr-10"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
            >
              {isLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
              {isLoading ? t("reset.saving") : t("reset.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/", { replace: true })}
              className="rounded-full border-black/10 bg-white/70 px-6 text-slate-950 hover:bg-white"
            >
              {t("nav.back_home")}
            </Button>
          </div>
        </form>
      </EditorialPanel>
    </EditorialPage>
  );
};

export default ResetPassword;
