import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ExternalLink, Loader2, Tag, Sparkles, Lightbulb, DollarSign, Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTool } from '@/hooks/useTool';
import { cn } from '@/lib/utils';
import ReviewSection from '@/components/ReviewSection';
import AverageRating from '@/components/AverageRating';
import SimilarTools from '@/components/SimilarTools';
import { useSEO } from '@/hooks/useSEO';
import { useStructuredData } from '@/hooks/useStructuredData';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useClickTracking } from '@/hooks/useClickTracking';

const ToolDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const { data: tool, isLoading, error } = useTool(id);
  const { recordClick } = useClickTracking();

  const displayTitle = tool ? (isAr ? tool.title : (tool.title_en || tool.title)) : undefined;
  const displayDescription = tool ? (isAr ? tool.description : (tool.description_en || tool.description)) : undefined;

  useSEO({
    title: displayTitle,
    description: displayDescription ? `${displayDescription.slice(0, 150)}...` : undefined,
    keywords: tool ? `${displayTitle}، ${tool.category}، ذكاء اصطناعي، أدوات AI` : undefined,
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
    image: tool.image_url || undefined,
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
    name: 'نبض',
    description: 'دليل أدوات الذكاء الاصطناعي',
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4" dir={isAr ? "rtl" : "ltr"}>
        <p className="text-2xl text-destructive">
          {isAr ? "لم يتم العثور على الأداة" : "Tool not found"}
        </p>
        <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
          <ArrowRight className={cn("h-4 w-4", !isAr && "rotate-180")} />
          {isAr ? "العودة للرئيسية" : "Back to Home"}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isAr ? "rtl" : "ltr"}>
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
            <ArrowRight className={cn("h-5 w-5", !isAr && "rotate-180")} />
            {isAr ? "العودة للرئيسية" : "Back to Home"}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl animate-fade-in">

        {/* 1. رأس الصفحة (Header) */}
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          {/* صورة / أيقونة الأداة */}
          <div className="w-full md:w-1/3">
            <div className="aspect-video bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden relative group">
              {tool.image_url ? (
                <img
                  src={tool.image_url}
                  alt={displayTitle}
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-tr from-neon-purple/20 to-transparent" />
                  <h1 className="text-6xl font-bold text-white/10 group-hover:text-neon-purple/20 transition-colors">
                    {displayTitle?.charAt(0)}
                  </h1>
                </>
              )}
            </div>
          </div>

          {/* معلومات الأداة + الملخص السريع */}
          <div className="w-full md:w-2/3 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
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
                <span className="text-xs text-gray-400 block">{isAr ? "السعر" : "Price"}</span>
                <span className="font-bold text-sm text-white">{tool.pricing_type}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                <Tag className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                <span className="text-xs text-gray-400 block">{isAr ? "التصنيف" : "Category"}</span>
                <span className="font-bold text-sm text-white">{tool.category}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                <Globe className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                <span className="text-xs text-gray-400 block">{isAr ? "الموقع" : "Website"}</span>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordClick(tool.id)}
                  className="font-bold text-sm text-neon-purple hover:underline"
                >
                  {isAr ? "زيارة ↗" : "Visit ↗"}
                </a>
              </div>
              {tool.is_featured && (
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-center">
                  <Sparkles className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                  <span className="text-xs text-gray-400 block">{isAr ? "الحالة" : "Status"}</span>
                  <span className="font-bold text-sm text-yellow-400">{isAr ? "⭐ مميز" : "⭐ Featured"}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. المميزات والمحتوى */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            {/* Features Section */}
            {tool.features && tool.features.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Check className="text-neon-purple" />
                  {isAr ? "المميزات الرئيسية" : "Key Features"}
                </h3>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <ul className="space-y-4">
                    {tool.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-neon-purple/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-neon-purple" />
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* FAQs Section */}
            {tool.faqs && tool.faqs.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Lightbulb className="text-neon-purple" />
                  {isAr ? "الأسئلة الشائعة" : "FAQ"}
                </h3>
                <Accordion type="single" collapsible className="space-y-3">
                  {tool.faqs.map((faq, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`faq-${idx}`}
                      className="bg-white/5 border border-white/10 rounded-xl px-6"
                    >
                      <AccordionTrigger className="text-foreground hover:no-underline py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {/* Reviews Section */}
            <div className="glass rounded-2xl p-6 md:p-8">
              <ReviewSection toolId={tool.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA Button */}
            <div className="bg-gradient-to-br from-neon-purple/10 to-neon-blue/10 rounded-xl p-6 border border-white/10 sticky top-24">
              <h4 className="font-bold text-lg mb-3 text-white">
                {isAr ? "جرب الأداة الآن" : "Try this tool now"}
              </h4>
              <Button
                className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 text-white font-bold py-3 gap-2"
                asChild
              >
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => recordClick(tool.id)}
                >
                  <ExternalLink className="h-4 w-4" />
                  {isAr ? "زيارة الموقع" : "Visit Website"}
                </a>
              </Button>
              {tool.pricing_type !== 'مجاني' && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  {isAr
                    ? "* قد يتطلب التسجيل بطاقة ائتمان"
                    : "* May require credit card for signup"
                  }
                </p>
              )}
            </div>

            {/* Ad Space Placeholder */}
            <div className="bg-black/40 rounded-xl p-6 border border-white/5 text-center">
              <p className="text-gray-500 text-sm">{isAr ? "مساحة إعلانية" : "Ad Space"}</p>
            </div>
          </div>
        </div>

        {/* 3. Similar Tools */}
        <SimilarTools currentToolId={tool.id} category={tool.category} />

      </div>
    </div>
  );
};

export default ToolDetails;
