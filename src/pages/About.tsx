import { Activity, ArrowUpRight, Target, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { useTranslation } from "react-i18next";
import { EditorialHero, EditorialPage, EditorialPanel } from "@/components/layout/EditorialPage";

const About = () => {
  const { t } = useTranslation();

  useSEO({
    title: "حول نبض - دليل أدوات الذكاء الاصطناعي",
    description: "تعرف على نبض، الدليل العربي الشامل لأفضل أدوات الذكاء الاصطناعي. نساعدك في اكتشاف الأدوات المناسبة لعملك وإبداعك.",
    keywords: "نبض، حول، دليل الذكاء الاصطناعي، أدوات AI، من نحن",
  });

  const features = [
    {
      icon: Target,
      title: t("about.mission_title"),
      description: t("about.mission_desc"),
    },
    {
      icon: Users,
      title: t("about.who_title"),
      description: t("about.who_desc"),
    },
    {
      icon: Zap,
      title: t("about.why_title"),
      description: t("about.why_desc"),
    },
  ];

  return (
    <EditorialPage>
      <EditorialHero
        eyebrow={t("nav.about")}
        title={t("about.title")}
        description={t("about.subtitle")}
        icon={<Activity className="h-7 w-7" />}
        actions={
          <>
            <Link to="/">
              <Button className="h-12 rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800">
                {t("about.browse_tools")}
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="h-12 rounded-full border-black/10 bg-white/70 px-6 text-slate-950 hover:bg-white">
                {t("about.contact_us")}
              </Button>
            </Link>
          </>
        }
        aside={
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">NABD AI</span>
            <h2 className="font-editorial text-3xl font-semibold leading-tight">
              منصة عربية تركّز على الاختيار الواعي، لا على جمع الروابط فقط.
            </h2>
            <p className="text-sm leading-7 text-white/70">
              الفكرة الأساسية في نبض هي تقليل الضوضاء. نحن نحاول تحويل سوق الأدوات من قائمة ضخمة ومربكة إلى مساحة بحث واكتشاف أوضح.
            </p>
          </div>
        }
      />

      <section className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <EditorialPanel key={feature.title} className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-slate-950 text-white">
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h2 className="font-editorial text-2xl font-semibold text-slate-950">{feature.title}</h2>
                <p className="text-sm leading-7 text-slate-600">{feature.description}</p>
              </div>
            </EditorialPanel>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <EditorialPanel className="space-y-5">
          <span className="editorial-kicker">{t("about.story_title")}</span>
          <div className="space-y-4 text-slate-600">
            <p className="text-lg leading-8">{t("about.story_p1")}</p>
            <p className="text-lg leading-8">{t("about.story_p2")}</p>
            <p className="text-lg leading-8">{t("about.story_p3")}</p>
          </div>
        </EditorialPanel>

        <div className="editorial-ink-panel flex flex-col justify-between p-6 sm:p-7">
          <div className="space-y-4 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">{t("about.cta")}</span>
            <h2 className="font-editorial text-3xl font-semibold leading-tight">
              إذا كنت تبحث عن واجهة أخف وأذكى لاكتشاف أدوات AI، فهذه هي البداية المناسبة.
            </h2>
            <p className="text-sm leading-7 text-white/70">
              يمكنك التصفح من الصفحة الرئيسية، استخدام المقارنة، أو إرسال اقتراحاتك لبناء دليل أكثر نفعًا للمستخدم العربي.
            </p>
          </div>

          <Link to="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/85 transition-colors hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
            {t("nav.back_home")}
          </Link>
        </div>
      </div>
    </EditorialPage>
  );
};

export default About;
