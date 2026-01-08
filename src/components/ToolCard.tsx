import React, { useState, useMemo } from 'react';
import { optimizeImage } from '@/utils/imageOptimizer';
import { Link } from 'react-router-dom';
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
import { useTranslation } from 'react-i18next';

interface ToolCardProps {
  tool: Tool;
  index?: number;
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

const ToolCard = ({ tool, index = 0 }: ToolCardProps) => {
  const prefetchTool = usePrefetchTool();
  const [imageError, setImageError] = useState(false);
  const { recordClick } = useClickTracking();
  const { selectedTools, addToCompare, removeFromCompare } = useCompare();
  const isCompared = selectedTools.includes(String(tool.id));
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const displayTitle = isAr ? tool.title : (tool.title_en || tool.title);
  const displayDescription = isAr ? tool.description : (tool.description_en || tool.description);

  const CategoryIcon = categoryIcons[tool.category] || Sparkles;
  const isSponsored = tool.is_sponsored === true;
  const supportsArabic = tool.supports_arabic === true;

  // Logic for badges
  const isNew = useMemo(() => {
    if (!tool.created_at) return false;
    const createdDate = new Date(tool.created_at);
    // Tool is new if created within last 30 days
    const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceCreation <= 30;
  }, [tool.created_at]);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(String(tool.id));
    } else {
      addToCompare(String(tool.id));
    }
  };

  const handleMouseEnter = () => {
    prefetchTool(String(tool.id));
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordClick(String(tool.id));
  };


  // Google Favicon API - reliable and fast
  const getFaviconUrl = (url: string): string | null => {
    try {
      if (!url) return null;
      const hostname = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
    } catch {
      return null;
    }
  };

  // Image priority logic - Original image or Favicon fallback
  const showOriginalImage = tool.image_url && !imageError;
  const faviconUrl = !showOriginalImage ? getFaviconUrl(tool.url) : null;

  return (
    <div
      className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:border-neon-purple/50 hover:shadow-[0_0_25px_rgba(124,58,237,0.15)] hover:-translate-y-1 flex flex-col h-full"
      onMouseEnter={handleMouseEnter}
      style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
    >

      {/* 1. الجزء العلوي (أزرار التحكم) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

        {/* زر المقارنة ⚖️ */}
        <button
          onClick={handleCompareClick}
          className={cn(
            "p-2 rounded-full backdrop-blur-md transition-all shadow-lg",
            isCompared
              ? "bg-neon-purple text-white shadow-neon-purple/20 scale-100 opacity-100"
              : "bg-black/40 text-gray-300 hover:bg-neon-purple hover:text-white"
          )}
          title={isCompared ? "إزالة من المقارنة" : "إضافة للمقارنة"}
        >
          <Scale className="w-4 h-4" />
        </button>

      </div>

      {/* زر المفضلة الثابت (يظهر دائماً) ❤️ */}
      <div className="absolute top-3 left-3 z-20">
        <BookmarkButton toolId={String(tool.id)} className="bg-black/40 hover:bg-black/60 text-white border-none" />
      </div>

      {/* Badges - New / Sponsored */}
      <div className="absolute top-3 right-12 z-10 flex gap-2">
        {isSponsored && (
          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-[10px] px-2 py-0.5 border-0 gap-1">
            <Crown className="w-3 h-3" /> ممول
          </Badge>
        )}
        {isNew && !isSponsored && (
          <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-[10px] px-2 py-0.5 border-0 gap-1 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]">
            <Clock className="w-3 h-3" /> جديد
          </Badge>
        )}
      </div>

      {/* 2. المحتوى */}
      <Link to={`/tool/${tool.id}`} className="flex flex-col h-full">
        <div className="p-6 flex flex-col h-full">

          {/* العنوان والأيقونة */}
          <div className="flex justify-between items-start mb-4 pl-4 mt-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500 group-hover:scale-105 overflow-hidden",
                showOriginalImage
                  ? "bg-white/5 border-white/10"
                  : "bg-neon-purple/10 border-neon-purple/20 group-hover:border-neon-purple/50"
              )}>
                {/* Priority 1: Manual image_url */}
                {showOriginalImage ? (
                  <LazyImage
                    src={optimizeImage(tool.image_url, 400)}
                    alt={displayTitle}
                    width={48}
                    height={48}
                    className="w-full h-full p-1.5 object-contain"
                    onError={() => setImageError(true)}
                  />
                ) : faviconUrl ? (
                  /* Priority 2: Google Favicon */
                  <img
                    src={faviconUrl}
                    alt={displayTitle}
                    className="w-8 h-8 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                    }}
                  />
                ) : null}

                {/* Fallback: First Letter or Category Icon */}
                <div className={cn(
                  "fallback-icon flex items-center justify-center w-full h-full",
                  (showOriginalImage || faviconUrl) ? "hidden" : "flex"
                )}>
                  {tool.title ? (
                    <span className="text-xl font-bold text-neon-purple">
                      {tool.title.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <CategoryIcon className="w-6 h-6 text-neon-purple opacity-70" />
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-neon-purple transition-colors line-clamp-1">
                  {displayTitle}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <SimpleRating rating={tool.average_rating} count={tool.reviews_count} />
                </div>
              </div>
            </div>
          </div>

          {/* الوصف */}
          <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2 flex-grow">
            {displayDescription}
          </p>

          {/* المميزات (Badges) */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
              {tool.category}
            </Badge>
            <Badge variant="outline" className={cn(
              "border hover:bg-opacity-20 transition-colors",
              tool.pricing_type === 'مجاني' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                tool.pricing_type === 'مدفوع' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                  tool.pricing_type === 'تجربة مجانية' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
            )}>
              {tool.pricing_type}
            </Badge>
            {supportsArabic && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1">
                <Languages className="w-3 h-3" /> عربي
              </Badge>
            )}
          </div>

          {/* الفوتر: زر التفاصيل */}
          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-neon-purple" />
              AI Powered
            </span>
            <span
              className="flex items-center gap-1 group-hover:text-neon-purple font-medium transition-colors z-20 cursor-pointer"
              onClick={handleExternalClick}
            >
              {t('tools.visit')} <ExternalLink className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ToolCard;
