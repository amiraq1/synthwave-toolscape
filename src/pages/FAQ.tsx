import { useEffect } from "react";
import { HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSEO } from "@/hooks/useSEO";
import { useTranslation } from "react-i18next";
import { EditorialHero, EditorialPage, EditorialPanel } from "@/components/layout/EditorialPage";

interface FAQItem {
  question: string;
  answer: string;
}

const getFaqData = (t: (key: string) => string): FAQItem[] => [
  { question: t("faq.q1"), answer: t("faq.a1") },
  { question: t("faq.q2"), answer: t("faq.a2") },
  { question: t("faq.q3"), answer: t("faq.a3") },
  { question: t("faq.q4"), answer: t("faq.a4") },
  { question: t("faq.q5"), answer: t("faq.a5") },
  { question: t("faq.q6"), answer: t("faq.a6") },
  { question: t("faq.q7"), answer: t("faq.a7") },
  { question: t("faq.q8"), answer: t("faq.a8") },
];

const FAQ = () => {
  const { t } = useTranslation();
  const faqData = getFaqData(t);

  useSEO({
    title: t("faq.meta_title"),
    description: t("faq.meta_desc"),
    keywords: t("faq.meta_keywords"),
  });

  useEffect(() => {
    const existingScript = document.querySelector("script[data-faq-schema]");
    if (existingScript) {
      existingScript.remove();
    }

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqData.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-faq-schema", "true");
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [faqData]);

  return (
    <EditorialPage>
      <EditorialHero
        eyebrow={t("nav.faq")}
        title={t("faq.title")}
        description={t("faq.subtitle")}
        icon={<HelpCircle className="h-7 w-7" />}
        aside={
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">FAQ</span>
            <h2 className="font-editorial text-3xl font-semibold leading-tight">
              إجابات مباشرة للأسئلة التي تتكرر قبل استخدام الدليل أو اقتراح أداة جديدة.
            </h2>
            <p className="text-sm leading-7 text-white/70">
              جمعنا هنا الأسئلة الأكثر شيوعًا حتى تبقى تجربة التصفح أوضح، وتنتقل إلى الصفحة المناسبة دون بحث إضافي.
            </p>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <EditorialPanel className="p-4 sm:p-5">
          <Accordion type="single" collapsible className="space-y-3">
            {faqData.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-[1.5rem] border border-black/8 bg-white/70 px-5"
              >
                <AccordionTrigger className="py-5 text-start hover:no-underline">
                  <span className="font-editorial text-xl font-medium text-slate-950">{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-7 text-slate-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </EditorialPanel>

        <div className="editorial-paper flex flex-col justify-between p-6 sm:p-7">
          <div className="space-y-4">
            <span className="editorial-kicker">{t("faq.not_found")}</span>
            <h2 className="font-editorial text-3xl font-semibold leading-tight text-slate-950">
              إذا لم تجد إجابتك هنا، فالأفضل أن تراسلنا مباشرة بدل التخمين.
            </h2>
            <p className="text-sm leading-7 text-slate-600">
              بعض الأسئلة مرتبطة بميزة جديدة أو إعداد تقني محدد. في هذه الحالات، التواصل المباشر أسرع من التشتت بين الصفحات.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to="/contact">
              <Button className="h-12 rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800">
                {t("about.contact_us")}
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="h-12 rounded-full border-black/10 bg-white/70 px-6 text-slate-950 hover:bg-white">
                {t("nav.back_home")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </EditorialPage>
  );
};

export default FAQ;
