import React, { useState, useMemo } from 'react';
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
  LayoutGrid,
  Crown,
  Tag,
  Languages,
  Flame,
  Clock,
  Scale
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Tool } from '@/hooks/useTools';
import { usePrefetchTool } from '@/hooks/useTool';
import BookmarkButton from './BookmarkButton';
import { cn } from '@/lib/utils';
import LazyImage from './LazyImage';
import { useClickTracking } from '@/hooks/useClickTracking';
import { useCompare } from '@/context/CompareContext';

interface ToolCardProps {
  tool: Tool;
  index: number;
}

// Category icons mapping
const categoryIcons: Record<string, React.ElementType> = {
  'نصوص': Type,
  'صور': ImageIcon,
  'فيديو': Video,
  'برمجة': Code,
  'إنتاجية': Zap,
  'صوت': Music,
  'الكل': LayoutGrid
};

// Category gradient colors
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
  const { recordClick } = useClickTracking();
  const { selectedTools, addToCompare, removeFromCompare } = useCompare();
  const isInCompareList = selectedTools.includes(tool.id);

  const categoryStyle = categoryGradients[tool.category] || 'from-gray-500/20 to-gray-600/20 text-gray-400 border-gray-500/20';
  const CategoryIcon = categoryIcons[tool.category] || Sparkles;
  const isSponsored = tool.is_sponsored === true;
  const supportsArabic = tool.supports_arabic === true;
  const hasDeal = !!tool.coupon_code && (!tool.deal_expiry || new Date(tool.deal_expiry) > new Date());

  // TAAFT-Style Indicators
  const isNew = useMemo(() => {
    if (!tool.release_date) return false;
    const releaseDate = new Date(tool.release_date);
    const daysSinceRelease = Math.floor((Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceRelease <= 30;
  }, [tool.release_date]);

  const isTrending = tool.is_featured === true || (tool.clicks_count && tool.clicks_count > 1000);
  const arabicScore = tool.arabic_score ?? (supportsArabic ? 7 : 0); // Default 7 if supports_arabic is true

  const handleCardClick = () => {
    navigate(`/tool/${tool.id}`);
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordClick(tool.id);
  };

  const handleMouseEnter = () => {
    prefetchTool(tool.id);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCompareList) {
      removeFromCompare(tool.id);
    } else {
      addToCompare(tool.id);
    }
  };



  // Google Favicon API - reliable and fast
  const getFaviconUrl = (url: string): string | null => {
    try {
      const hostname = new URL(url).hostname;
      // Use Google's favicon service with high resolution
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch {
      return null;
    }
  };

  // Image priority logic - Original image or Favicon fallback
  const showOriginalImage = tool.image_url && !imageError;
  const faviconUrl = !showOriginalImage ? getFaviconUrl(tool.url) : null;

  return (
    <article
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      className={cn(
        "group relative flex flex-col h-full rounded-2xl p-5 transition-all duration-300 hover:translate-y-[-4px] backdrop-blur-sm cursor-pointer overflow-hidden",
        // Sponsored styling
        isSponsored
          ? "bg-gradient-to-br from-amber-500/5 to-yellow-600/5 border-2 border-amber-500/40 hover:border-amber-400/60 shadow-[0_0_20px_-5px_rgba(245,158,11,0.25)] hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)]"
          : "bg-card/30 hover:bg-card/50 border border-white/5 hover:border-white/10 hover:shadow-2xl hover:shadow-neon-purple/5"
      )}
      style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
      dir="rtl"
    >
      {/* Sponsored Badge */}
      {isSponsored && (
        <div className="absolute top-3 right-3 z-20">
          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-[10px] px-2 py-0.5 border-0 gap-1">
            <Crown className="w-3 h-3" />
            ممول
          </Badge>
        </div>
      )}

      {/* NEW Badge - Pulsating Teal */}
      {isNew && !isSponsored && (
        <div className="absolute top-3 right-3 z-20">
          <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-[10px] px-2 py-0.5 border-0 gap-1 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]">
            <Clock className="w-3 h-3" />
            جديد
          </Badge>
        </div>
      )}

      {/* Bookmark Button */}
      <BookmarkButton
        toolId={tool.id}
        className="absolute top-3 left-3 z-20 h-9 w-9 rounded-full transition-all hover:scale-110"
      />

      {/* Compare Button */}
      <button
        onClick={handleCompareClick}
        className={cn(
          "absolute top-3 left-14 z-20 p-2 rounded-full backdrop-blur-md transition-all hover:scale-110",
          isInCompareList
            ? "bg-neon-purple text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]"
            : "bg-black/30 text-gray-400 hover:bg-white/10 hover:text-white"
        )}
        title={isInCompareList ? "إزالة من المقارنة" : "أضف للمقارنة"}
        aria-label={isInCompareList ? "إزالة من المقارنة" : "أضف للمقارنة"}
      >
        <Scale className="w-4 h-4" />
      </button>

      {/* Top Section */}
      <div className="flex items-start gap-4 mb-4 z-10">
        {/* Smart Icon Container */}
        <div
          className={cn(
            "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 shadow-lg overflow-hidden",
            "border backdrop-blur-md",
            isSponsored
              ? "border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-yellow-600/10"
              : showOriginalImage
                ? "bg-white/10 border-white/10" // Clean background for logos
                : `bg-gradient-to-br ${categoryStyle}`
          )}
        >
          {/* Priority 1: Manual image_url */}
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
            /* Priority 2: Google Favicon */
            <img
              src={faviconUrl}
              alt={tool.title}
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
              }}
            />
          ) : null}

          {/* Fallback: Category Icon */}
          <div className={cn(
            "fallback-icon absolute inset-0 flex items-center justify-center",
            (showOriginalImage || faviconUrl) ? "hidden" : "flex"
          )}>
            <CategoryIcon className="w-7 h-7 sm:w-8 sm:h-8 opacity-90" strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className={cn(
              "text-lg font-bold transition-colors truncate",
              isSponsored
                ? "text-amber-100 group-hover:text-amber-300"
                : "text-white group-hover:text-neon-purple"
            )}>
              {tool.title}
            </h3>

            {/* Trending Indicator */}
            {isTrending && (
              <span className="flex items-center gap-0.5 text-orange-400" title="رائج">
                <Flame className="w-4 h-4 fill-orange-400 animate-pulse" />
              </span>
            )}

            {tool.is_featured && !isSponsored && !isTrending && (
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

          {/* Arabic Support Badge with Score Meter */}
          {(supportsArabic || arabicScore > 0) && (
            <div className="flex items-center gap-1">
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0 gap-1">
                <Languages className="w-2.5 h-2.5" />
                عربي
                {arabicScore > 0 && (
                  <span className="flex gap-0.5 mr-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "w-1 h-2 rounded-sm",
                          i < Math.ceil(arabicScore / 2)
                            ? "bg-emerald-400"
                            : "bg-emerald-400/20"
                        )}
                      />
                    ))}
                  </span>
                )}
              </Badge>
            </div>
          )}

          {/* Deal/Coupon Badge */}
          {hasDeal && (
            <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] px-1.5 py-0 gap-0.5 animate-pulse">
              <Tag className="w-2.5 h-2.5" />
              عرض
            </Badge>
          )}
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
          className={cn(
            "h-8 w-8 rounded-full transition-colors",
            isSponsored
              ? "hover:bg-amber-500/20 hover:text-amber-400 text-muted-foreground"
              : "hover:bg-neon-purple/20 hover:text-neon-purple text-muted-foreground"
          )}
          onClick={handleExternalClick}
        >
          <a href={tool.url} target="_blank" rel="noopener noreferrer" aria-label={`زيارة موقع ${tool.title}`}>
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      {/* Gradient Glow Effect */}
      <div className={cn(
        "absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none",
        isSponsored ? 'bg-amber-500' : tool.category === 'برمجة' ? 'bg-orange-500' : 'bg-neon-purple'
      )} />
    </article>
  );
};

export default ToolCard;
