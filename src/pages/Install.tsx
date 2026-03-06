import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Download,
  Share,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import {
  EditorialHero,
  EditorialPage,
  EditorialPanel,
} from "@/components/layout/EditorialPage";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  const steps = [
    t("install.ios_step1"),
    t("install.ios_step2"),
    t("install.ios_step3"),
  ];

  return (
    <EditorialPage className="pb-10" dir={i18n.dir()}>
      <EditorialHero
        eyebrow={t("install.prompt_title")}
        title={t("brand.name")}
        description={t("install.prompt_desc")}
        icon={<Download className="h-7 w-7" />}
        aside={
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">
              PWA
            </span>
            <h2 className="font-editorial text-3xl font-semibold leading-tight">
              {isInstalled
                ? t("install.installed")
                : isIOS
                  ? t("install.ios_title")
                  : deferredPrompt
                    ? t("install.prompt_title")
                    : t("install.browse_now")}
            </h2>
            <p className="text-sm leading-7 text-white/72">
              {isInstalled
                ? t("install.installed_desc")
                : isIOS
                  ? t("install.ios_desc")
                  : t("install.browse_desc")}
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                  Mode
                </p>
                <p className="mt-2 font-medium">
                  {isIOS ? "iOS" : deferredPrompt ? "Install Ready" : "Browser"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                  Status
                </p>
                <p className="mt-2 font-medium">
                  {isInstalled ? "Standalone" : "Web App"}
                </p>
              </div>
            </div>
          </div>
        }
      />

      <EditorialPanel className="max-w-4xl">
        {isInstalled ? (
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-emerald-500/12 text-emerald-700">
                <CheckCircle className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h2 className="font-editorial text-2xl font-semibold text-slate-950">
                  {t("install.installed")}
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-slate-600">
                  {t("install.installed_desc")}
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate("/")}
              className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
            >
              {t("nav.back_home")}
            </Button>
          </div>
        ) : isIOS ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-slate-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-editorial text-2xl font-semibold">
                  {t("install.ios_title")}
                </h2>
                <p className="text-sm text-slate-600">{t("install.ios_desc")}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step} className="editorial-soft-card p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-slate-700">
                    {index === 0 ? (
                      <>
                        {step} <Share className="mx-1 inline h-4 w-4" />
                      </>
                    ) : (
                      step
                    )}
                  </p>
                </div>
              ))}
            </div>

            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="rounded-full border-black/10 bg-white/70 px-6 text-slate-950 hover:bg-white"
            >
              {t("nav.back_home")}
            </Button>
          </div>
        ) : deferredPrompt ? (
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="font-editorial text-2xl font-semibold text-slate-950">
                {t("install.prompt_title")}
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                {t("install.prompt_desc")}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleInstall}
                className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
              >
                <Download className="me-2 h-4 w-4" />
                {t("install.install_btn")}
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="rounded-full border-black/10 bg-white/70 px-6 text-slate-950 hover:bg-white"
              >
                {t("install.later")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="font-editorial text-2xl font-semibold text-slate-950">
                {t("install.browse_now")}
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                {t("install.browse_desc")}
              </p>
            </div>

            <Button
              onClick={() => navigate("/")}
              className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
            >
              {t("nav.back_home")}
            </Button>
          </div>
        )}
      </EditorialPanel>
    </EditorialPage>
  );
};

export default Install;
