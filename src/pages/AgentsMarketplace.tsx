import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Bot, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  EditorialHero,
  EditorialPage,
  EditorialPanel,
} from "@/components/layout/EditorialPage";

const AgentsMarketplace = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <EditorialPage dir={i18n.dir()}>
      <Helmet>
        <title>{t("coming_soon.agents_title")} | نبض AI</title>
        <meta name="description" content={t("coming_soon.agents_desc")} />
      </Helmet>

      <EditorialHero
        eyebrow={t("coming_soon.title")}
        title={t("coming_soon.agents_heading")}
        description={t("coming_soon.agents_desc")}
        icon={<Bot className="h-7 w-7" />}
        aside={
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">
              Agents
            </span>
            <h2 className="font-editorial text-3xl font-semibold leading-tight">
              Marketplace in Progress
            </h2>
            <p className="text-sm leading-7 text-white/72">
              صفحة الوكلاء ستتحول إلى مساحة اكتشاف ومقارنة وسير عمل، وليست مجرد
              قائمة ثابتة.
            </p>
          </div>
        }
      />

      <EditorialPanel className="max-w-4xl">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="font-editorial text-2xl font-semibold">
                {t("coming_soon.title")}
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              {t("coming_soon.agents_desc")}
            </p>
          </div>

          <Button
            onClick={() => navigate("/")}
            className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800"
          >
            {t("nav.back_home")}
            <ArrowRight className="ms-2 h-4 w-4" />
          </Button>
        </div>
      </EditorialPanel>
    </EditorialPage>
  );
};

export default AgentsMarketplace;
