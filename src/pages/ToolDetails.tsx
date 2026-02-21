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
  ChevronRight,
  Zap
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
import { getCategoryLabel, getPricingLabel, getPricingTier } from '@/utils/localization';
import { cn } from '@/lib/utils';
import BookmarkButton from './BookmarkButton';

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
  const pricingTier = tool ? getPricingTier(tool.pricing_type) : undefined;
  const safeImageUrl = tool ? (getToolImageUrl(tool.image_url, tool.url) ?? undefined) : undefined;

  useSEO({
    title: displayTitle ? `${displayTitle} - AI Tool` : 'Tool Details',
    description: displayDescription ? `${displayDescription.slice(0, 150)}...` : undefined,
    keywords: tool ? `${displayTitle}, ${displayCategory}, AI tools, software tools, artificial intelligence` : undefined,
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
      <div className="min-h-screen bg-[#050508] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
        <Loader2 className="h-16 w-16 animate-spin text-neon-purple drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen bg-[#050508] flex flex-col items-center justify-center gap-6 relative" dir={isAr ? "rtl" : "ltr"}>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
        <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-center shadow-2xl">
          <p className="text-2xl text-rose-500 font-bold mb-4 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]">
            {isAr ? "عذراً، الأداة غير موجودة" : "404 - Tool Not Found"}
          </p>
          <Button onClick={() => navigate('/')} className="bg-white/10 hover:bg-white/20 text-white border border-white/10 gap-2 px-8 h-12 rounded-xl transition-all hover:scale-105">
            {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {isAr ? "العودة للقاعدة الرئيسية" : "Return to Nexus"}
          </Button>
        </div>
      </div>
    );
  }

  const functionsBaseUrl = getSupabaseFunctionsBaseUrl();
  const ogImageUrl = functionsBaseUrl
    ? `${functionsBaseUrl}/og-image?title=${encodeURIComponent(displayTitle || "")}&category=${encodeURIComponent(tool.category)}`
    : "";

  return (
    <div className="min-h-screen bg-[#050508] relative selection:bg-neon-purple/30 selection:text-white" dir={isAr ? "rtl" : "ltr"}>
      <Helmet>
        <title>{`${displayTitle} | Nabd AI`}</title>
        <meta name="description" content={displayDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      {/* Abstract Atmosphere & Light Blooms */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[800px] h-[600px] bg-neon-purple/10 rounded-full blur-[150px] opacity-50 mix-blend-screen" />
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-neon-cyan/5 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay" />
      </div>

      {/* Glassmorphic Navigation */}
      <header className="sticky top-0 z-40 bg-[#050508]/60 backdrop-blur-2xl border-b border-white/5 supports-[backdrop-filter]:bg-[#050508]/40 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 h-20 flex items-center justify-between">
          <Button
            onClick={handleBack}
            variant="ghost"
            className="gap-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl h-12 px-4 transition-all hover:-translate-x-1"
          >
            <ArrowRight className={cn("h-5 w-5", !isAr && "rotate-180")} />
            <span className="hidden sm:inline font-bold uppercase tracking-widest text-xs">{isAr ? "رجوع" : "Back"}</span>
          </Button>

          <div className="flex items-center gap-2">
            <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
              <BookmarkButton toolId={String(tool.id)} className="border-none bg-transparent hover:bg-white/10 text-slate-300 hover:text-white shadow-none h-12 w-12" />
            </div>
            <Button
              onClick={handleShare}
              variant="outline"
              size="icon"
              className="bg-black/40 border-white/10 text-slate-300 hover:bg-neon-purple/20 hover:text-neon-purple hover:border-neon-purple/50 rounded-xl h-12 w-12 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
              aria-label="Share tool"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-7xl relative z-10 space-y-16 animate-slide-up">

        {/* Core Nexus Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

          <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col justify-center relative">

            {/* Context Badges */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              {tool.is_featured && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAr ? "مميز" : "Featured"}
                </div>
              )}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 text-slate-300 border border-white/10">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(tool.created_at || Date.now()).getFullYear()}
              </div>
            </div>

            {/* Title & Ratings */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-5 leading-[1.1] drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {displayTitle}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="p-1 rounded-lg bg-black/40 border border-white/5 backdrop-blur-md">
                <AverageRating rating={tool.average_rating} count={tool.reviews_count} size="lg" />
              </div>
            </div>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-10 text-balance font-medium">
              {displayDescription}
            </p>

            {/* Metric Blocks */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className={cn(
                "p-5 rounded-2xl border bg-[#0a0a14] flex flex-col items-start justify-center shadow-lg transition-colors hover:bg-[#101018]",
                pricingTier === 'free' ? 'border-emerald-500/20' :
                  pricingTier === 'paid' ? 'border-amber-500/20' :
                    pricingTier === 'trial' || pricingTier === 'freemium' ? 'border-purple-500/20' :
                      'border-white/10'
              )}>
                <div className="flex items-center gap-2 mb-2 text-slate-500">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest font-bold">{isAr ? "الترخيص" : "License"}</span>
                </div>
                <span className={cn(
                  "font-black text-xl tracking-tight",
                  pricingTier === 'free' ? 'text-emerald-400' :
                    pricingTier === 'paid' ? 'text-amber-400' :
                      pricingTier === 'trial' || pricingTier === 'freemium' ? 'text-purple-400' :
                        'text-white'
                )}>{displayPricing}</span>
              </div>
              <div className="p-5 rounded-2xl bg-[#0a0a14] border border-white/10 flex flex-col items-start justify-center shadow-lg hover:bg-[#101018] transition-colors">
                <div className="flex items-center gap-2 mb-2 text-slate-500">
                  <Tag className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest font-bold">{isAr ? "البيئة" : "Ecosystem"}</span>
                </div>
                <span className="font-black text-xl text-white tracking-tight line-clamp-1">{displayCategory}</span>
              </div>
            </div>

            {/* Primary Action */}
            <div className="hidden md:block">
              <Button
                onClick={() => {
                  recordClick(tool.id);
                  window.open(tool.url, '_blank', 'noopener,noreferrer');
                }}
                className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-wider bg-white text-black hover:bg-neon-purple hover:text-white glow-purple transition-all duration-300 overflow-hidden relative group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-black group-hover:text-white transition-colors" />
                  {isAr ? "تشغيل عبر الموقع الرسمي" : "Launch Official Interface"}
                  <ExternalLink className={cn("h-5 w-5 transition-transform group-hover:translate-x-1", isAr ? "mr-2" : "ml-2")} />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="p-2 md:p-3 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-xl shadow-2xl">
              <ToolGallery title={displayTitle || ""} images={safeImageUrl ? [safeImageUrl] : []} />
            </div>
          </div>
        </div>

        {/* Detailed Spec Array */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-16 items-start">

          <div className="xl:col-span-8 space-y-12">

            {/* Features Array */}
            {tool.features && tool.features.length > 0 && (
              <section className="bg-[#0a0a14] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-neon-purple/20 border border-neon-purple/50">
                    <Sparkles className="text-neon-purple w-5 h-5" />
                  </div>
                  {isAr ? "القدرات الرئيسية" : "Core Capabilities"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tool.features.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 p-5 rounded-2xl bg-black/40 border border-white/5 group hover:border-neon-purple/30 hover:bg-neon-purple/5 transition-all">
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:bg-neon-purple/20 group-hover:border-neon-purple/40 transition-colors">
                        <Check className="w-3.5 h-3.5 text-emerald-400 group-hover:text-neon-purple transition-colors" />
                      </div>
                      <span className="text-slate-300 font-medium leading-relaxed group-hover:text-white transition-colors">{isAr ? translateFeature(feature) : feature}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Knowledge Base (FAQ) */}
            {tool.faqs && tool.faqs.length > 0 && (
              <section className="bg-[#0a0a14] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/50">
                    <Lightbulb className="text-amber-400 w-5 h-5" />
                  </div>
                  {isAr ? "قاعدة المعرفة" : "Knowledge Base"}
                </h3>
                <Accordion type="single" collapsible className="space-y-4">
                  {tool.faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`} className="border border-white/10 bg-black/40 rounded-2xl px-2 overflow-hidden data-[state=open]:border-neon-cyan/50 transition-colors">
                      <AccordionTrigger className="px-4 py-5 hover:no-underline text-[1.05rem] font-bold text-white text-right [&>svg]:text-neon-cyan gap-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-5 pt-1 text-slate-400 leading-relaxed text-base font-medium">
                        <div className="pl-4 border-l-2 border-neon-cyan/50 rtl:pl-0 rtl:pr-4 rtl:border-l-0 rtl:border-r-2 gap-4">
                          {faq.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            )}
          </div>

          {/* Contextual Sidebar */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-gradient-to-b from-[#0a0a14] to-transparent rounded-3xl p-8 border border-white/5 sticky top-32">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                <Share2 className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="font-black text-2xl text-white mb-3">
                {isAr ? "توسيع النطاق؟" : "Extend the Network?"}
              </h4>
              <p className="text-base text-slate-400 mb-8 leading-relaxed font-medium">
                {isAr
                  ? "قم بتعزيز قدرات فريقك المعرفية عبر مشاركة نقطة المعالجة هذه."
                  : "Boost your team's capabilities by sharing this processor node."}
              </p>
              <Button
                className="w-full h-14 text-white uppercase font-bold tracking-widest gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all font-mono shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                {isAr ? "مشاركة الإحداثيات" : "Broadcast Link"}
              </Button>
            </div>
          </div>
        </div>

        {/* Similar Tools Radar */}
        <div className="border-t border-white/5 pt-16">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="h-8 w-1.5 bg-neon-purple rounded-full" />
            <h2 className="text-3xl font-black tracking-tight text-white">{isAr ? "رادار الأدوات المشابهة" : "Similar Nodes"}</h2>
          </div>
          <SimilarTools currentToolId={tool.id} category={tool.category} />
        </div>
      </main>

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#050508]/80 backdrop-blur-3xl border-t border-white/10 md:hidden z-50 safe-area-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex gap-3 max-w-7xl mx-auto">
          <Button
            onClick={() => {
              recordClick(tool.id);
              window.open(tool.url, '_blank', 'noopener,noreferrer');
            }}
            className="flex-1 bg-white text-black hover:bg-neon-purple hover:text-white glow-purple uppercase tracking-widest font-black h-14 rounded-xl transition-all"
          >
            <Zap className={cn("w-4 h-4", isAr ? "ml-2" : "mr-2")} />
            {isAr ? "تشغيل عبر الموقع رسمي" : "Launch"}
          </Button>
        </div>
      </div>
      {/* 
   We keep this spacing so that the mobile sticky bar doesn't overlay bottom content 
*/}
      <div className="h-24 md:h-10" />
    </div>
  );
};

export default ToolDetails;
