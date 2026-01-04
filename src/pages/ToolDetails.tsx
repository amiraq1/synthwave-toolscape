import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink, Loader2, CheckCircle2, Copy, Tag, Languages, Sparkles, Lightbulb, Target, DollarSign, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTool } from '@/hooks/useTool';
import { cn } from '@/lib/utils';
import ReviewSection from '@/components/ReviewSection';
import AverageRating from '@/components/AverageRating';
import { useSEO } from '@/hooks/useSEO';
import { useStructuredData } from '@/hooks/useStructuredData';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClickTracking } from '@/hooks/useClickTracking';

// Component to handle tool icon with fallback
const ToolIcon = ({ imageUrl, gradient }: { imageUrl: string | null; gradient: string }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={cn(
      "w-28 h-28 md:w-36 md:h-36 rounded-2xl flex items-center justify-center text-5xl md:text-6xl shrink-0 overflow-hidden border border-white/20",
      `bg-gradient-to-br ${gradient}`
    )}>
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt=""
          width={144}
          height={144}
          loading="eager"
          decoding="async"
          className="w-full h-full object-contain p-4 bg-white/10 rounded-xl"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>🤖</span>
      )}
    </div>
  );
};

// Category gradient mapping
const categoryGradients: Record<string, string> = {
  'نصوص': 'from-emerald-500 to-teal-600',
  'صور': 'from-purple-500 to-pink-600',
  'فيديو': 'from-blue-500 to-cyan-600',
  'برمجة': 'from-gray-600 to-gray-800',
  'إنتاجية': 'from-amber-500 to-yellow-600',
};

const ToolDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tool, isLoading, error } = useTool(id);
  const { recordClick } = useClickTracking();

  useSEO({
    title: tool?.title,
    description: tool?.description ? `${tool.description.slice(0, 150)}...` : undefined,
    keywords: tool ? `${tool.title}، ${tool.category}، ذكاء اصطناعي، أدوات AI` : undefined,
    ogTitle: tool?.title,
    ogDescription: tool?.description,
    ogImage: tool?.image_url || undefined,
    ogType: 'article',
  });

  useStructuredData(tool ? {
    type: 'software',
    name: tool.title,
    description: tool.description,
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4" dir="rtl">
        <p className="text-2xl text-destructive">لم يتم العثور على الأداة</p>
        <Button onClick={() => navigate('/')} variant="outline" className="gap-2">
          <ArrowRight className="h-4 w-4" />
          العودة للرئيسية
        </Button>
      </div>
    );
  }

  const gradient = categoryGradients[tool.category] || 'from-neon-purple to-neon-blue';

  return (
    <div className="min-h-screen bg-background" dir="rtl">
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
            <ArrowRight className="h-5 w-5" />
            العودة للرئيسية
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-5xl px-4 py-12 space-y-12">
        <div className="glass rounded-3xl p-8 md:p-12 space-y-8">
          {/* Tool Header */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Icon/Image */}
            <ToolIcon imageUrl={tool.image_url} gradient={gradient} />

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  {tool.title}
                </h1>
                <AverageRating rating={tool.average_rating} count={tool.reviews_count} size="md" />
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge
                  variant="secondary"
                  className="bg-neon-purple/20 text-neon-purple border-neon-purple/30 text-base px-4 py-1"
                >
                  {tool.category}
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn(
                    "border text-base px-4 py-1",
                    tool.pricing_type === 'مجاني'
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  )}
                >
                  {tool.pricing_type}
                </Badge>
                {tool.is_featured && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-base px-4 py-1"
                  >
                    ⭐ مميز
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">نبذة عن الأداة</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {tool.description}
            </p>
          </div>

          {/* Coupon Code Section */}
          {tool.coupon_code && (!tool.deal_expiry || new Date(tool.deal_expiry) > new Date()) && (
            <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 border-2 border-dashed border-rose-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-rose-400">عرض حصري!</h3>
                  <p className="text-sm text-muted-foreground">استخدم الكود للحصول على خصم</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-background/50 border border-rose-500/20 rounded-xl px-4 py-3 text-lg font-mono text-center text-rose-300 tracking-wider">
                  {tool.coupon_code}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl"
                  onClick={() => {
                    navigator.clipboard.writeText(tool.coupon_code || '');
                    // You can add a toast here
                  }}
                >
                  <Copy className="w-5 h-5" />
                </Button>
              </div>
              {tool.deal_expiry && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  ⏰ ينتهي العرض: {new Date(tool.deal_expiry).toLocaleDateString('ar-SA')}
                </p>
              )}
            </div>
          )}

          {/* Arabic Support Notice */}
          {tool.supports_arabic && (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <Languages className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">هذه الأداة تدعم اللغة العربية بالكامل 🇸🇦</span>
            </div>
          )}

          {/* Screenshots Gallery */}
          {tool.screenshots && tool.screenshots.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">لقطات الشاشة</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tool.screenshots.map((shot, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/20 aspect-video"
                  >
                    <img
                      src={shot}
                      alt={`لقطة شاشة ${index + 1} لـ ${tool.title}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Demonstration */}
          {tool.video_url && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">فيديو توضيحي</h2>
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border/60 bg-black/20 shadow-xl">
                <iframe
                  src={tool.video_url}
                  title={`Video demonstration for ${tool.title}`}
                  className="absolute top-0 left-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Features */}
          {tool.features && tool.features.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-400" />
                أهم المميزات
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tool.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-muted-foreground"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Use Cases / Tasks - NEW SECTION */}
          {tool.tasks && tool.tasks.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Target className="w-6 h-6 text-neon-purple" />
                كيف تستفيد من هذه الأداة؟
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tool.tasks.map((task, index) => (
                  <div
                    key={index}
                    className="group p-4 bg-gradient-to-br from-neon-purple/5 to-neon-blue/5 border border-neon-purple/20 rounded-xl hover:border-neon-purple/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neon-purple/20 flex items-center justify-center shrink-0 group-hover:bg-neon-purple/30 transition-colors">
                        <Lightbulb className="w-4 h-4 text-neon-purple" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{task}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Details - NEW SECTION */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-400" />
              معلومات التسعير
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Free Tier */}
              <div className={cn(
                "p-5 rounded-2xl border",
                tool.pricing_type === 'مجاني'
                  ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30"
                  : "bg-muted/30 border-border/50"
              )}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🆓</span>
                  <h3 className="font-bold text-lg">الخطة المجانية</h3>
                </div>
                <p className="text-3xl font-bold text-emerald-400 mb-2">$0</p>
                <p className="text-sm text-muted-foreground">
                  {tool.pricing_type === 'مجاني'
                    ? "استخدام مجاني بالكامل"
                    : tool.pricing_type === 'تجربة مجانية'
                      ? "تجربة مجانية محدودة"
                      : "غير متاح"
                  }
                </p>
              </div>

              {/* Pro Tier */}
              <div className={cn(
                "p-5 rounded-2xl border",
                tool.pricing_type === 'مدفوع' || tool.pricing_type === 'تجربة مجانية'
                  ? "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30"
                  : "bg-muted/30 border-border/50"
              )}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⭐</span>
                  <h3 className="font-bold text-lg">الخطة الاحترافية</h3>
                </div>
                <p className="text-3xl font-bold text-amber-400 mb-2">
                  {tool.pricing_type === 'مجاني' ? '-' : 'مدفوع'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {tool.pricing_type !== 'مجاني'
                    ? "ميزات متقدمة ودعم أفضل"
                    : "غير مطلوب"
                  }
                </p>
              </div>

              {/* Enterprise Tier */}
              <div className="p-5 rounded-2xl border bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🏢</span>
                  <h3 className="font-bold text-lg">الشركات</h3>
                </div>
                <p className="text-3xl font-bold text-purple-400 mb-2">تواصل معنا</p>
                <p className="text-sm text-muted-foreground">
                  حلول مخصصة للشركات
                </p>
              </div>
            </div>
          </div>

          {/* Comparison Table (Alternatives) */}
          {tool.alternatives && tool.alternatives.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">مقارنة مع البدائل</h2>
              <div className="border border-border/50 rounded-xl overflow-hidden glass">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-white/5 border-border/50">
                      <TableHead className="text-right">الأداة</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-right">التصنيف</TableHead>
                      <TableHead className="text-right">التقييم</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Current Tool */}
                    <TableRow className="bg-neon-purple/5 hover:bg-neon-purple/10 border-border/50">
                      <TableCell className="font-bold text-neon-purple">
                        {tool.title} (الحالية)
                      </TableCell>
                      <TableCell>{tool.pricing_type}</TableCell>
                      <TableCell>{tool.category}</TableCell>
                      <TableCell>⭐ {tool.average_rating || '-'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          {tool.faqs && tool.faqs.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">الأسئلة الشائعة</h2>
              <Accordion type="single" collapsible className="w-full">
                {tool.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50">
                    <AccordionTrigger className="text-lg font-medium hover:text-neon-purple hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* Smart CTA Button */}
          <div className="pt-6">
            <Button
              asChild
              size="lg"
              className={cn(
                "w-full md:w-auto gap-3 text-lg px-8 py-6 shadow-xl transition-all duration-300 hover:scale-105",
                tool.pricing_type === 'مجاني'
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/20"
                  : tool.pricing_type === 'تجربة مجانية'
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/20"
                    : "bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple/80 hover:to-neon-blue/80 shadow-neon-purple/20"
              )}
            >
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordClick(tool.id)}
              >
                {tool.pricing_type === 'مجاني' ? (
                  <>جرب الأداة مجاناً <ExternalLink className="h-5 w-5" /></>
                ) : tool.pricing_type === 'تجربة مجانية' ? (
                  <>ابدأ التجربة المجانية <Sparkles className="h-5 w-5" /></>
                ) : (
                  <>زيارة الموقع الرسمي <ExternalLink className="h-5 w-5" /></>
                )}
              </a>
            </Button>
            {tool.pricing_type !== 'مجاني' && (
              <p className="text-xs text-muted-foreground mt-3 mr-2">
                * قد يتطلب التسجيل بطاقة ائتمان في بعض المواقع
              </p>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="glass rounded-3xl p-8 md:p-12">
          <ReviewSection toolId={tool.id} />
        </div>
      </main>
    </div>
  );
};

export default ToolDetails;
