import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  ExternalLink,
  Loader2,
  Tag,
  Sparkles,
  Lightbulb,
  DollarSign,
  Check,
  Share2,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTool } from '@/hooks/useTool';
import AverageRating from '@/components/AverageRating';
import SimilarTools from '@/components/SimilarTools';
import ToolGallery from "@/components/ToolGallery";
import { useSEO } from '@/hooks/useSEO';
import { useStructuredData } from '@/hooks/useStructuredData';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useClickTracking } from '@/hooks/useClickTracking';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { getToolImageUrl } from '@/utils/imageUrl';
import { translateFeature } from '@/utils/featureTranslations';
import { getSupabaseFunctionsBaseUrl } from '@/utils/supabaseUrl';
import { toast } from 'sonner';
import { getCategoryLabel, getPricingLabel } from '@/utils/localization';

const ToolDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const { data: tool, isLoading, error } = useTool(id);
  const { recordClick } = useClickTracking();
  const { addToRecent } = useRecentlyViewed();

  useEffect(() => {
    if (tool?.id) {
      addToRecent(String(tool.id));
    }
  }, [tool?.id, addToRecent]);

  const displayTitle = tool ? (isAr ? tool.title : (tool.title_en || tool.title)) : undefined;
  const displayDescription = tool ? (isAr ? tool.description : (tool.description_en || tool.description)) : undefined;
  const displayCategory = tool ? getCategoryLabel(tool.category, isAr) : undefined;
  const displayPricing = tool ? getPricingLabel(tool.pricing_type, isAr) : undefined;
  const safeImageUrl = tool ? (getToolImageUrl(tool.image_url, tool.url) ?? undefined) : undefined;

  useSEO({
    title: displayTitle,
    description: displayDescription ? `${displayDescription.slice(0, 150)}...` : undefined,
    keywords: tool ? `${displayTitle}, ${displayCategory}, AI tools, software tools` : undefined,
    ogTitle: displayTitle,
    ogDescription: displayDescription,
    ogImage: safeImageUrl,
    ogType: 'article',
  });

  useStructuredData(tool ? {
    type: 'software',
    name: displayTitle || tool.title,
    description: displayDescription || tool.description,
    url: tool.url,
    image: safeImageUrl,
    category: displayCategory || tool.category,
    pricingType: displayPricing || tool.pricing_type,
    rating: tool.average_rating,
    reviewCount: tool.reviews_count,
    faq: tool.faqs?.map(f => ({
      question: f.question,
      answer: f.answer
    }))
  } : null);

  const handleBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: displayTitle,
          text: displayDescription,
          url: window.location.href,
        });
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success(isAr ? "تم نسخ الرابط" : "Link copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-neon-purple" />
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4" dir={isAr ? "rtl" : "ltr"}>
        <p className="text-2xl text-destructive font-semibold">
          {isAr ? "عذراً، الأداة غير موجودة" : "Tool not found"}
        </p>
        <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
          {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {isAr ? "العودة للرئيسية" : "Back to Home"}
        </Button>
      </div>
    );
  }

  const functionsBaseUrl = getSupabaseFunctionsBaseUrl();
  const ogImageUrl = functionsBaseUrl
    ? `${functionsBaseUrl}/og-image?title=${encodeURIComponent(displayTitle || "")}&category=${encodeURIComponent(tool.category)}`
    : "";

  return (
    <div className="min-h-screen bg-background relative selection:bg-neon-purple/30" dir={isAr ? "rtl" : "ltr"}>
      <Helmet>
        <title>{displayTitle} | Nabd AI</title>
        <meta name="description" content={displayDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      <div className="fixed top-0 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[128px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[128px] -z-10 pointer-events-none" />

      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5 supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            {isAr ? <ArrowRight className="h-5 w-5" /> : <ArrowRight className="h-5 w-5 rotate-180" />}
            <span className="hidden sm:inline">{isAr ? "رجوع" : "Back"}</span>
          </Button>

          <Button
            onClick={handleShare}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-neon-purple"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in pb-32">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">

          <div className="lg:col-span-7 order-1 lg:order-2">
            <ToolGallery title={displayTitle || ""} images={safeImageUrl ? [safeImageUrl] : []} />
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {tool.is_featured && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                      <Sparkles className="w-3 h-3" />
                      {isAr ? "مميز" : "Featured"}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-400 border border-white/10">
                    <Calendar className="w-3 h-3" />
                    {new Date().getFullYear()}
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
                  {displayTitle}
                </h1>

                <div className="flex items-center gap-4 mb-6">
                  <AverageRating rating={tool.average_rating} count={tool.reviews_count} size="md" />
                </div>

                <p className="text-lg text-gray-300 leading-relaxed">
                  {displayDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center transition-colors hover:bg-white/10">
                  <DollarSign className="w-6 h-6 mb-2 text-green-400" />
                  <span className="text-xs text-gray-500 mb-1">{isAr ? "نظام التسعير" : "Pricing"}</span>
                  <span className="font-semibold text-white">{displayPricing}</span>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center transition-colors hover:bg-white/10">
                  <Tag className="w-6 h-6 mb-2 text-blue-400" />
                  <span className="text-xs text-gray-500 mb-1">{isAr ? "التصنيف" : "Category"}</span>
                  <span className="font-semibold text-white">{displayCategory}</span>
                </div>
              </div>

              <div className="hidden md:flex gap-4 pt-4">
                <Button
                  onClick={() => {
                    recordClick(tool.id);
                    window.open(tool.url, '_blank');
                  }}
                  className="w-full h-14 text-lg bg-neon-purple hover:bg-neon-purple/90 shadow-[0_0_30px_rgba(124,58,237,0.3)]"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  {isAr ? "زيارة الموقع الرسمي" : "Visit Official Website"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-8 space-y-8">

            {tool.features && tool.features.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-neon-purple w-6 h-6" />
                  {isAr ? "المميزات الرئيسية" : "Key Features"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tool.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-neon-purple/30 transition-colors">
                      <div className="mt-1 w-5 h-5 rounded-full bg-neon-purple/20 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-neon-purple" />
                      </div>
                      <span className="text-gray-200 text-sm leading-relaxed">{translateFeature(feature)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tool.faqs && tool.faqs.length > 0 && (
              <section className="space-y-4 pt-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Lightbulb className="text-yellow-400 w-6 h-6" />
                  {isAr ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
                </h3>
                <Accordion type="single" collapsible className="space-y-3">
                  {tool.faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`} className="border border-white/10 bg-white/5 rounded-xl px-2">
                      <AccordionTrigger className="px-4 hover:no-underline text-base font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 text-gray-400 leading-relaxed text-base">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-neon-purple/20 to-transparent rounded-2xl p-6 border border-white/10 sticky top-24">
              <h4 className="font-bold text-white mb-2">{isAr ? "هل أعجبتك الأداة؟" : "Like this tool?"}</h4>
              <p className="text-sm text-gray-400 mb-4">
                {isAr
                  ? "شارك هذه الأداة مع أصدقائك أو احفظها للمستقبل."
                  : "Share this tool with your friends or save it for later."}
              </p>
              <Button variant="outline" className="w-full gap-2" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
                {isAr ? "مشاركة" : "Share"}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-white/10 pt-10">
          <SimilarTools currentToolId={tool.id} category={tool.category} />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-white/10 md:hidden z-50 safe-area-bottom">
        <div className="flex gap-3">
          <Button
            onClick={() => {
              recordClick(tool.id);
              window.open(tool.url, '_blank');
            }}
            className="flex-1 bg-neon-purple hover:bg-neon-purple/90 text-white font-bold h-12 shadow-lg shadow-neon-purple/20"
          >
            {isAr ? "زيارة الموقع" : "Visit Site"}
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

    </div>
  );
};

export default ToolDetails;
