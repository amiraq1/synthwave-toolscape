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
    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md border border-slate-200/60">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      <span className="text-sm font-semibold tabular-nums text-slate-700">{safeRating.toFixed(1)}</span>
      <span className="text-xs text-slate-400 hidden sm:inline">({safeCount})</span>
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
      className="group relative editorial-soft-card overflow-hidden transition-all duration-500 hover:shadow-[0_24px_64px_rgba(15,23,42,0.12)] hover:border-slate-300/60 flex flex-col h-full will-change-transform"
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
              ? "bg-teal-600 text-white shadow-teal-600/20 scale-100 opacity-100"
              : "bg-white/80 text-slate-500 hover:bg-teal-600 hover:text-white border border-slate-200/60"
          )}
          title={isCompared ? t("tools.remove_compare") : t("tools.add_compare")}
          aria-label={isCompared ? t("tools.remove_compare") : t("tools.add_compare")}
        >
          <Scale className="w-4 h-4" />
        </button>

      </div>

      {/* زر المفضلة الثابت (يظهر دائماً) ❤️ */}
      <div className="absolute top-3 left-3 z-20">
        <BookmarkButton toolId={String(tool.id)} className="bg-white/80 hover:bg-white text-slate-500 hover:text-rose-500 border border-slate-200/60 shadow-sm" />
      </div>

      {/* Badges - New / Sponsored */}
      <div className="absolute top-3 right-12 z-10 flex gap-2">
        {isSponsored && (
          <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-[10px] px-2 py-0.5 border-0 gap-1">
            <Crown className="w-3 h-3" /> {t("tools.sponsored")}
          </Badge>
        )}
        {isNew && !isSponsored && (
          <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-[10px] px-2 py-0.5 border-0 gap-1 animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.3)]">
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
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-teal-700 transition-colors line-clamp-1">
                  {displayTitle}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <SimpleRating rating={tool.average_rating} count={tool.reviews_count} />
                </div>
              </div>
            </div>
          </div>

          {/* الوصف */}
          <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2 flex-grow">
            {displayDescription}
          </p>

          {/* المميزات (Badges) */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200/80 hover:bg-sky-100">
              {getCategoryLabel(tool.category)}
            </Badge>
            <Badge variant="outline" className={cn(
              "border transition-colors",
              getPricingTier(tool.pricing_type) === 'free' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' :
                getPricingTier(tool.pricing_type) === 'paid' ? 'bg-orange-50 text-orange-700 border-orange-200/80' :
                  getPricingTier(tool.pricing_type) === 'trial' ? 'bg-violet-50 text-violet-700 border-violet-200/80' :
                    'bg-slate-50 text-slate-600 border-slate-200/80'
            )}>
              {getPricingLabel(tool.pricing_type)}
            </Badge>
            {supportsArabic && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200/80 gap-1">
                <Languages className="w-3 h-3" /> {t("tools.arabic")}
              </Badge>
            )}
          </div>

          {/* الفوتر: زر التفاصيل */}
          <div className="mt-auto pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-500 transition-colors">
            <span className="flex items-center gap-1 text-slate-400 group-hover:text-slate-500">
              <Zap className="w-3 h-3 text-teal-600" aria-hidden="true" />
              {t('tools.ai_powered')}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 font-medium transition-colors z-20 rounded px-1",
                toolWebsiteUrl
                  ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 group-hover:text-teal-700"
                  : "cursor-not-allowed text-slate-300",
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
