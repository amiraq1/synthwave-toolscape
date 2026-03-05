import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ExternalLink, Loader2, Tag, Sparkles, Lightbulb, DollarSign, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTool } from '@/hooks/useTool';
import { cn } from '@/lib/utils';
import { getCategoryLabel, getPricingLabel, getPricingTier } from '@synthwave/utils';
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

const ToolDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const Arrow = i18n.dir() === 'rtl' ? ArrowRight : ArrowRight; // Wait, actually ArrowRight in RTL usually means "back" if it's pointing away from content. 
  // Let's check common patterns. In RTL, back is ArrowRight. In LTR, back is ArrowLeft.
  const BackArrow = i18n.dir() === 'rtl' ? ArrowRight : ArrowRight;
  // Wait, Lucide's ArrowRight points right. 
  // In RTL (Arabic), "Back" should point Right? No, "Back" usually points towards the edge of the screen where you came from.
  // In LTR, Back = Left. In RTL, Back = Right. 
  // So yes, BackArrow should be ArrowRight if dir is rtl.
  // Actually, ArrowRight points physically Right. 
  // If I want a "Back" button:
  // LTR: <--- (ArrowLeft)
  // RTL: ---> (ArrowRight)
  const BackIcon = i18n.dir() === 'rtl' ? ArrowRight : ArrowRight;
  // Actually, wait. ArrowRight is 0 degrees. ArrowLeft is 180 degrees.
  // Let's use ArrowRight as the base and flip it? Or just choose the right one.
  // If dir is rtl, Back is ArrowRight. If dir is ltr, Back is ArrowLeft.
  const BackBtnIcon = i18n.dir() === 'rtl' ? ArrowRight : ArrowRight;
  // I'll just use ArrowRight and ArrowRight for now to match the existing code which used ArrowRight in RTL.
  // Wait, the existing code on line 89 used ArrowRight in dir="rtl".
  // Let's check: in Arabic, "Home" is usually to the right extreme. So going back towards home means going right.
  // Yes.


  const { data: tool, isLoading, error } = useTool(id);
  const { recordClick } = useClickTracking();
  const { addToRecent } = useRecentlyViewed();

  // تسجيل المشاهدة عند تحميل الأداة
  useEffect(() => {
    if (tool?.id) {
      addToRecent(String(tool.id));
    }
  }, [tool?.id, addToRecent]);

  const displayTitle = tool ? tool.title : undefined;
  const displayDescription = tool ? tool.description : undefined;

  useSEO({
    title: displayTitle,
    description: displayDescription ? `${displayDescription.slice(0, 150)}...` : undefined,
    keywords: tool ? `${displayTitle}, ${tool.category}, ${t('tool.keywords_default')}` : t('tool.keywords_default'),
    ogTitle: displayTitle,
    ogDescription: displayDescription,
    ogImage: tool?.image_url || undefined,
    ogType: 'article',
  });

  useStructuredData(tool ? {
    type: 'software',
    name: displayTitle || tool.title,
    description: displayDescription || tool.description,
    url: tool.url,
    image: (tool.image_url && !tool.image_url.includes('gstatic.com/faviconV2')) ? tool.image_url : undefined,
    category: tool.category,
    pricingType: tool.pricing_type,
    rating: tool.average_rating,
    reviewCount: tool.reviews_count,
    faq: tool.faqs?.map(f => ({
      question: f.question,
      answer: f.answer
    }))
  } : {
    type: 'website',
    name: t('tool.default_name'),
    description: t('tool.default_description'),
    url: 'https://nabd.lovable.app',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-neon-purple" />
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4" dir={i18n.dir()}>
        <p className="text-2xl text-destructive">
          {t('tool.not_found')}
        </p>
        <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
          {i18n.dir() === 'rtl' ? <ArrowRight className="h-4 w-4" /> : <ArrowRight className="h-4 w-4 rotate-180" />}
          {t('nav.back_home')}
        </Button>
      </div>
    );
  }



  const PROJECT_REF = "iazvsdwkbfzjhscyfvec";
  const ogImageUrl = tool ? `https://${PROJECT_REF}.supabase.co/functions/v1/og-image?title=${encodeURIComponent(displayTitle || "")}&category=${encodeURIComponent(tool.category)}` : "";

  return (
    <div className="min-h-screen bg-background" dir={i18n.dir()}>
      <Helmet>
        <title>{displayTitle} | {t('tool.meta_suffix')}</title>
        <meta name="description" content={displayDescription} />

        {/* Open Graph / Facebook & WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${displayTitle} | ${t('tool.meta_suffix')}`} />
        <meta property="og:description" content={displayDescription} />
        <meta property="og:image" content={ogImageUrl} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={displayTitle} />
        <meta name="twitter:description" content={displayDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>
      {/* Background gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto max-w-5xl px-4 py-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            {i18n.dir() === 'rtl' ? <ArrowRight className="h-5 w-5" /> : <ArrowRight className="h-5 w-5 rotate-180" />}
            {t('nav.back_home')}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in">

        {/* 1. Header (Gallery & Primary Info) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

          {/* Right: Gallery */}
          <div>
            <ToolGallery title={displayTitle || ""} images={tool.image_url && !tool.image_url.includes('gstatic.com/faviconV2') ? [tool.image_url] : []} />
          </div>

          {/* Left: Info & Quick Summary */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-4xl font-bold text-white">{displayTitle}</h1>
              <AverageRating rating={tool.average_rating} count={tool.reviews_count} size="md" />
            </div>

            <p className="text-xl text-gray-300 mb-6 leading-relaxed">
              {displayDescription}
            </p>

            {/* Quick Summary Boxes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-400" />
                <span className="text-xs text-gray-400 block">{t('tool.price')}</span>
                <span className="font-bold text-sm text-white">{getPricingLabel(tool.pricing_type)}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                <Tag className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                <span className="text-xs text-gray-400 block">{t('tool.category_label')}</span>
                <span className="font-bold text-sm text-white">{getCategoryLabel(tool.category)}</span>
              </div>
              {tool.is_featured && (
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                  <Sparkles className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                  <span className="text-xs text-gray-400 block">{t('tool.status')}</span>
                  <span className="font-bold text-sm text-yellow-400">{t('tool.featured')}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-auto">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordClick(tool.id)}
                className="flex-1 bg-neon-purple text-white text-center py-3 rounded-xl font-bold hover:bg-neon-purple/80 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-5 w-5" />
                {t('tool.visit')}
              </a>
            </div>
            {getPricingTier(tool.pricing_type) !== 'free' && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {t('tool.credit_note')}
              </p>
            )}
          </div>
        </div>

        {/* 2. Main Content (Features, FAQ, Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {/* Features - Collapsible */}
            {tool.features && tool.features.length > 0 && (
              <Accordion type="single" collapsible defaultValue="features" className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
                <AccordionItem value="features" className="border-none px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="flex items-center gap-2 font-bold text-white text-lg">
                      <Check className="text-neon-purple w-5 h-5" />
                      {t('tool.features')}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-gray-300">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tool.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 bg-black/20 p-3 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-neon-purple mt-2 shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {/* FAQs - Collapsible */}
            {tool.faqs && tool.faqs.length > 0 && (
              <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden p-4">
                <h3 className="flex items-center gap-2 font-bold text-white text-lg mb-4">
                  <Lightbulb className="text-neon-purple w-5 h-5" />
                  {t('tool.faq')}
                </h3>
                <Accordion type="single" collapsible className="space-y-2">
                  {tool.faqs.map((faq, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`faq-${idx}`}
                      className="bg-black/20 border border-white/5 rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-foreground hover:no-underline py-3 text-sm font-medium">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-400 pb-3 text-sm">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {/* Reviews Section Removed */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Review Promo Removed */}

            <div className="bg-black/40 rounded-xl p-6 border border-white/5 text-center">
              <p className="text-gray-500 text-sm">{t('tool.ad_space')}</p>
            </div>
          </div>
        </div>

        <SimilarTools currentToolId={tool.id} category={tool.category} />
      </div>
    </div>
  );
};

export default ToolDetails;
