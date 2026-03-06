import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Star,
  Zap,
  Crown,
  Languages,
  Clock,
  Scale
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Tool } from '@/hooks/useTools';
import { usePrefetchTool } from '@/hooks/useTool';
import BookmarkButton from './BookmarkButton';
import { cn } from '@/lib/utils';
import { getCategoryLabel, getPricingLabel, getPricingTier, getValidToolUrl } from '@synthwave/utils';
import ToolLogo from '@/components/ToolLogo';
import { useClickTracking } from '@/hooks/useClickTracking';
import { useCompare } from '@/context/CompareContext';
import { useTranslation } from 'react-i18next';

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

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
  const { recordClick } = useClickTracking();
  const { selectedTools, addToCompare, removeFromCompare } = useCompare();
  const isCompared = selectedTools.includes(String(tool.id));
  const { t } = useTranslation();

  const displayTitle = tool.title;
  const displayDescription = tool.description;
  const toolWebsiteUrl = getValidToolUrl(tool.url);

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

  return (
    <div
      className="group relative bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden transition-all duration-500 hover:border-neon-purple/50 flex flex-col h-full gradient-border premium-glow card-spotlight gpu-accelerated"
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
          title={isCompared ? t("tools.remove_compare") : t("tools.add_compare")}
          aria-label={isCompared ? t("tools.remove_compare") : t("tools.add_compare")}
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
            <Crown className="w-3 h-3" /> {t("tools.sponsored")}
          </Badge>
        )}
        {isNew && !isSponsored && (
          <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-[10px] px-2 py-0.5 border-0 gap-1 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.5)]">
            <Clock className="w-3 h-3" /> {t("tools.new")}
          </Badge>
        )}
      </div>

      {/* 2. المحتوى */}
      <Link to={`/tool/${tool.id}`} className="flex flex-col h-full" aria-label={t('tools.view_details', { title: displayTitle })}>
        <div className="p-6 flex flex-col h-full">

          {/* العنوان والأيقونة */}
          <div className="flex justify-between items-start mb-4 pl-4 mt-6">
            <div className="flex items-center gap-3">
              <ToolLogo
                title={displayTitle}
                imageUrl={tool.image_url}
                category={tool.category}
                toolUrl={tool.url}
                size="md"
                priority={index < 6}
                className="transition-all duration-500 group-hover:scale-105"
              />

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
              {getCategoryLabel(tool.category)}
            </Badge>
            <Badge variant="outline" className={cn(
              "border hover:bg-opacity-20 transition-colors",
              getPricingTier(tool.pricing_type) === 'free' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                getPricingTier(tool.pricing_type) === 'paid' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                  getPricingTier(tool.pricing_type) === 'trial' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
            )}>
              {getPricingLabel(tool.pricing_type)}
            </Badge>
            {supportsArabic && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1">
                <Languages className="w-3 h-3" /> {t("tools.arabic")}
              </Badge>
            )}
          </div>

          {/* الفوتر: زر التفاصيل */}
          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 group-hover:text-gray-300 transition-colors">
            <span className="flex items-center gap-1 text-gray-400 group-hover:text-gray-300">
              <Zap className="w-3 h-3 text-neon-purple" aria-hidden="true" />
              {t('tools.ai_powered')}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 font-medium transition-colors z-20 rounded px-1",
                toolWebsiteUrl
                  ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-neon-purple group-hover:text-neon-purple"
                  : "cursor-not-allowed text-gray-600",
              )}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (!toolWebsiteUrl) return;
                handleExternalClick(e);
                window.open(toolWebsiteUrl, '_blank', 'noopener,noreferrer');
              }}
              aria-label={toolWebsiteUrl ? t('tools.visit_label', { title: displayTitle }) : t('tools.visit_unavailable')}
              title={toolWebsiteUrl ? t('tools.visit') : t('tools.visit_unavailable')}
            >
              {toolWebsiteUrl ? t('tools.visit') : t('tools.visit_unavailable')} <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ToolCard;
