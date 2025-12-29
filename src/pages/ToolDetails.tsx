import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTool } from '@/hooks/useTool';
import { cn } from '@/lib/utils';
import ReviewSection from '@/components/ReviewSection';
import AverageRating from '@/components/AverageRating';
import { useSEO } from '@/hooks/useSEO';
import { useStructuredData } from '@/hooks/useStructuredData';

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
                <AverageRating toolId={tool.id} size="md" />
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

          {/* Features */}
          {tool.features && tool.features.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">أهم المميزات</h2>
              <ul className="space-y-3">
                {tool.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-lg text-muted-foreground"
                  >
                    <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              asChild
              size="lg"
              className="w-full md:w-auto bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity gap-3 text-lg px-8 py-6"
            >
              <a href={tool.url} target="_blank" rel="noopener noreferrer">
                زيارة الموقع الرسمي
                <ExternalLink className="h-5 w-5" />
              </a>
            </Button>
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
