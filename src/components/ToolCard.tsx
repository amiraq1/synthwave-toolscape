import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Star,
  Type,
  Image as ImageIcon,
  Video,
  Code,
  Zap,
  Sparkles,
  Music,
  LayoutGrid
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Tool } from '@/hooks/useTools';
import { usePrefetchTool } from '@/hooks/useTool';
import { cn } from '@/lib/utils';
import LazyImage from './LazyImage';

interface ToolCardProps {
  tool: Tool;
  index: number;
}

// 1. ربط التصنيفات بأيقونات Lucide الحديثة
const categoryIcons: Record<string, React.ElementType> = {
  'نصوص': Type,
  'صور': ImageIcon,
  'فيديو': Video,
  'برمجة': Code,
  'إنتاجية': Zap,
  'صوت': Music,
  'الكل': LayoutGrid
};

// ألوان متدرجة لكل تصنيف
const categoryGradients: Record<string, string> = {
  'نصوص': 'from-emerald-500/20 to-teal-600/20 text-emerald-400 border-emerald-500/20',
  'صور': 'from-purple-500/20 to-pink-600/20 text-purple-400 border-purple-500/20',
  'فيديو': 'from-blue-500/20 to-cyan-600/20 text-blue-400 border-blue-500/20',
  'برمجة': 'from-orange-500/20 to-red-600/20 text-orange-400 border-orange-500/20',
  'إنتاجية': 'from-yellow-500/20 to-amber-600/20 text-yellow-400 border-yellow-500/20',
  'صوت': 'from-rose-500/20 to-pink-600/20 text-rose-400 border-rose-500/20',
};

const SimpleRating = ({ rating, count }: { rating?: number | null; count?: number | null }) => {
  const safeRating = typeof rating === 'number' && !Number.isNaN(rating) ? rating : 0;
  const safeCount = typeof count === 'number' && !Number.isNaN(count) ? count : 0;

  return (
    <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-md border border-white/5 backdrop-blur-sm">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      <span className="text-sm font-semibold tabular-nums text-white/90">{safeRating.toFixed(1)}</span>
      <span className="text-xs text-white/40 hidden sm:inline">({safeCount})</span>
    </div>
  );
};

const ToolCard = ({ tool, index }: ToolCardProps) => {
  const navigate = useNavigate();
  const prefetchTool = usePrefetchTool();
  const [imageError, setImageError] = useState(false);

  // تحديد الستايل والأيقونة بناءً على التصنيف
  const categoryStyle = categoryGradients[tool.category] || 'from-gray-500/20 to-gray-600/20 text-gray-400 border-gray-500/20';
  const CategoryIcon = categoryIcons[tool.category] || Sparkles;

  const handleCardClick = () => {
    navigate(`/tool/${tool.id}`);
  };

  const handleMouseEnter = () => {
    prefetchTool(tool.id);
  };

  // دالة لجلب Favicon الموقع في حال عدم وجود صورة
  const getFaviconUrl = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch {
      return null;
    }
  };

  // المنطق: هل نعرض الصورة الأصلية؟ أم الـ Favicon؟ أم الأيقونة؟
  const showOriginalImage = tool.image_url && !imageError;
  const faviconUrl = !showOriginalImage ? getFaviconUrl(tool.url) : null;

  return (
    <article
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      className="group relative flex flex-col h-full bg-card/30 hover:bg-card/50 border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl hover:shadow-neon-purple/5 backdrop-blur-sm cursor-pointer overflow-hidden"
      style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
      dir="rtl"
    >
      {/* Top Section */}
      <div className="flex items-start gap-4 mb-4 z-10">

        {/* Smart Icon Container */}
        <div
          className={cn(
            "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 shadow-lg",
            "bg-gradient-to-br border backdrop-blur-md", // الأساس الزجاجي
            showOriginalImage ? "bg-white/5 border-white/10" : categoryStyle // تلوين الخلفية إذا كانت أيقونة
          )}
        >
          {showOriginalImage ? (
            <LazyImage
              src={tool.image_url!}
              alt={tool.title}
              width={64}
              height={64}
              className="w-full h-full p-2 rounded-2xl object-contain"
              onError={() => setImageError(true)}
            />
          ) : faviconUrl ? (
            <img
              src={faviconUrl}
              alt={tool.title}
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
              }}
            />
          ) : null}

          {/* Fallback Icon (يظهر إذا فشلت الصور) */}
          <div className={cn(
            "fallback-icon absolute inset-0 flex items-center justify-center",
            (showOriginalImage || faviconUrl) ? "hidden" : "flex"
          )}>
            <CategoryIcon className="w-7 h-7 sm:w-8 sm:h-8 opacity-90" strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-lg font-bold text-white group-hover:text-neon-purple transition-colors truncate">
              {tool.title}
            </h3>
            {tool.is_featured && (
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-neon-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
              </span>
            )}
          </div>
          <Badge
            variant="secondary"
            className="bg-white/5 hover:bg-white/10 text-muted-foreground font-normal border-0 text-xs px-2"
          >
            {tool.category}
          </Badge>
        </div>
      </div>

      <p className="text-muted-foreground/80 text-sm leading-relaxed line-clamp-2 mb-5 flex-1 z-10">
        {tool.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto z-10">
        <div className="flex items-center gap-3">
          <SimpleRating rating={tool.average_rating} count={tool.reviews_count} />
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full border",
            tool.pricing_type === 'مجاني'
              ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/5"
              : "text-amber-400 border-amber-500/20 bg-amber-500/5"
          )}>
            {tool.pricing_type}
          </span>
        </div>

        <Button
          asChild
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full hover:bg-neon-purple/20 hover:text-neon-purple text-muted-foreground transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <a href={tool.url} target="_blank" rel="noopener noreferrer" aria-label="Visit">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      {/* Gradient Glow Effect (Background) */}
      <div className={cn(
        "absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none",
        tool.category === 'برمجة' ? 'bg-orange-500' : 'bg-neon-purple'
      )} />
    </article>
  );
};

export default ToolCard;
