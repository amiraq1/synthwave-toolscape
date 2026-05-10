import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check, DollarSign, ExternalLink, Lightbulb, Loader2, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTool } from "@/hooks/useTool";
import { getCategoryLabel, getPricingLabel, getPricingTier, getSupabaseFunctionsBaseUrl, getValidToolUrl } from "@synthwave/utils";
import AverageRating from "@/components/AverageRating";
import ReviewSection from "@/components/ReviewSection";
import SimilarTools from "@/components/SimilarTools";
import ToolGallery from "@/components/ToolGallery";
import { useSEO } from "@/hooks/useSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useClickTracking } from "@/hooks/useClickTracking";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { EditorialPage, EditorialPanel } from "@/components/layout/EditorialPage";

const ToolDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { data: tool, isLoading, error } = useTool(id);
  const { recordClick } = useClickTracking();
  const { addToRecent } = useRecentlyViewed();

  useEffect(() => {
    if (tool?.id) {
      addToRecent(String(tool.id));
    }
  }, [tool?.id, addToRecent]);

  const displayTitle = tool ? tool.title : undefined;
  const displayDescription = tool ? tool.description : undefined;
  const toolWebsiteUrl = tool ? getValidToolUrl(tool.url) : null;
  const detailPageUrl = tool ? `https://amiraq.org/tool/${tool.id}` : "https://amiraq.org";

  useSEO({
    title: displayTitle,
    description: displayDescription ? `${displayDescription.slice(0, 150)}...` : undefined,
    keywords: tool ? `${displayTitle}, ${tool.category}, ${t("tool.keywords_default")}` : t("tool.keywords_default"),
    ogTitle: displayTitle,
    ogDescription: displayDescription,
    ogImage: tool?.image_url || undefined,
    ogType: "article",
  });

  useStructuredData(
    tool
      ? {
          type: "software",
          name: displayTitle || tool.title,
          description: displayDescription || tool.description,
          url: detailPageUrl,
          image: tool.image_url && !tool.image_url.includes("gstatic.com/faviconV2") ? tool.image_url : undefined,
          category: tool.category,
          pricingType: tool.pricing_type,
          rating: tool.average_rating,
          reviewCount: tool.reviews_count,
          faq: tool.faqs?.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
          })),
        }
      : {
          type: "website",
          name: t("tool.default_name"),
          description: t("tool.default_description"),
          url: "https://amiraq.org",
        }
  );

  if (isLoading) {
    return (
      <EditorialPage>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-slate-950" />
        </div>
      </EditorialPage>
    );
  }

  if (error || !tool) {
    return (
      <EditorialPage>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-2xl text-destructive">{t("tool.not_found")}</p>
          <Button onClick={() => navigate("/")} variant="outline" className="gap-2 rounded-full border-black/10 bg-white px-5 text-slate-950 hover:bg-white">
            <ArrowRight className={`h-4 w-4 ${i18n.dir() === "ltr" ? "rotate-180" : ""}`} />
            {t("nav.back_home")}
          </Button>
        </div>
      </EditorialPage>
    );
  }

  const ogImageUrl = `${getSupabaseFunctionsBaseUrl()}/og-image?title=${encodeURIComponent(displayTitle || "")}&category=${encodeURIComponent(tool.category)}`;

  return (
    <EditorialPage>
      <Helmet>
        <title>{displayTitle} | {t("tool.meta_suffix")}</title>
        <meta name="description" content={displayDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${displayTitle} | ${t("tool.meta_suffix")}`} />
        <meta property="og:description" content={displayDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={displayTitle} />
        <meta name="twitter:description" content={displayDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      <section className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr] xl:gap-8">
        <EditorialPanel className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="editorial-kicker">{getCategoryLabel(tool.category)}</span>
            {tool.is_featured && (
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs text-amber-700">
                {t("tool.featured")}
              </span>
            )}
          </div>

          <div className="space-y-4">
            <h1 className="font-editorial text-4xl font-semibold leading-[1.05] text-slate-950 sm:text-5xl">
              {displayTitle}
            </h1>
            <p className="text-lg leading-8 text-slate-600">{displayDescription}</p>
            <AverageRating rating={tool.average_rating} count={tool.reviews_count} size="md" />
          </div>

          <ToolGallery
            title={displayTitle || ""}
            images={tool.image_url && !tool.image_url.includes("gstatic.com/faviconV2") ? [tool.image_url] : []}
          />
        </EditorialPanel>

        <div className="editorial-ink-panel flex flex-col justify-between p-6 sm:p-7">
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">{t("tool.status")}</span>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-center">
                <DollarSign className="mx-auto mb-2 h-5 w-5 text-emerald-300" />
                <span className="block text-xs text-white/45">{t("tool.price")}</span>
                <span className="mt-1 block text-sm font-semibold text-white">{getPricingLabel(tool.pricing_type)}</span>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-center">
                <Tag className="mx-auto mb-2 h-5 w-5 text-sky-300" />
                <span className="block text-xs text-white/45">{t("tool.category_label")}</span>
                <span className="mt-1 block text-sm font-semibold text-white">{getCategoryLabel(tool.category)}</span>
              </div>
            </div>

            {toolWebsiteUrl ? (
              <a
                href={toolWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordClick(tool.id)}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-slate-950 transition-colors hover:bg-white/90"
              >
                <ExternalLink className="h-4 w-4" />
                {t("tool.visit")}
              </a>
            ) : (
              <div
                className="flex h-12 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white/45"
                aria-disabled="true"
                title={t("tool.visit_unavailable")}
              >
                <ExternalLink className="h-4 w-4" />
                {t("tool.visit_unavailable")}
              </div>
            )}

            {getPricingTier(tool.pricing_type) !== "free" && (
              <p className="text-xs text-white/55">{t("tool.credit_note")}</p>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <EditorialPanel className="space-y-4">
          {tool.features && tool.features.length > 0 && (
            <Accordion type="single" collapsible defaultValue="features" className="rounded-[1.6rem] border border-black/8 bg-white/70 px-4">
              <AccordionItem value="features" className="border-none">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <span className="flex items-center gap-2 font-editorial text-2xl font-medium text-slate-950">
                    <Check className="h-5 w-5 text-teal-800" />
                    {t("tool.features")}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {tool.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 rounded-[1.4rem] border border-black/8 bg-[#f8f4eb] p-4">
                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-slate-950" />
                        <span className="text-sm leading-7 text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {tool.faqs && tool.faqs.length > 0 && (
            <div className="rounded-[1.6rem] border border-black/8 bg-white/70 p-4">
              <h3 className="mb-4 flex items-center gap-2 font-editorial text-2xl font-medium text-slate-950">
                <Lightbulb className="h-5 w-5 text-amber-700" />
                {t("tool.faq")}
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                {tool.faqs.map((faq, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`faq-${idx}`}
                    className="rounded-[1.2rem] border border-black/8 bg-[#f8f4eb] px-4"
                  >
                    <AccordionTrigger className="py-3 text-start text-sm font-medium text-slate-900 hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-3 text-sm leading-7 text-slate-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </EditorialPanel>

        <div className="editorial-ink-panel p-6 sm:p-7">
          <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">{t("tool.similar")}</span>
          <div className="mt-5">
            <SimilarTools currentToolId={tool.id} category={tool.category} />
          </div>
        </div>
      </div>

      <EditorialPanel className="space-y-4">
        <ReviewSection toolId={String(tool.id)} />
      </EditorialPanel>
    </EditorialPage>
  );
};

export default ToolDetails;
