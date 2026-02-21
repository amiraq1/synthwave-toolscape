import React, { memo, useMemo } from 'react';
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
  Languages,
  Scale
} from 'lucide-react';
import type { Tool } from '@/hooks/useTools';
import { usePrefetchTool } from '@/hooks/useTool';
import BookmarkButton from './BookmarkButton';
import { cn } from '@/lib/utils';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { useClickTracking } from '@/hooks/useClickTracking';
import { useCompare } from '@/context/CompareContext';
import { getToolImageUrl } from '@/utils/imageUrl';
import { getCategoryLabel, getPricingLabel, getPricingTier } from '@/utils/localization';

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

// Category aesthetic mappings (Tailwind syntax)
const categoryAesthetics: Record<string, { icon: React.ElementType, ring: string, glow: string }> = {
  'نصوص': { icon: Type, ring: 'border-blue-500/30 group-hover:border-blue-400', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]' },
  'صور': { icon: ImageIcon, ring: 'border-fuchsia-500/30 group-hover:border-fuchsia-400', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(217,70,239,0.3)]' },
  'فيديو': { icon: Video, ring: 'border-rose-500/30 group-hover:border-rose-400', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)]' },
  'برمجة': { icon: Code, ring: 'border-emerald-500/30 group-hover:border-emerald-400', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]' },
  'إنتاجية': { icon: Zap, ring: 'border-amber-500/30 group-hover:border-amber-400', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]' },
  'صوت': { icon: Music, ring: 'border-cyan-500/30 group-hover:border-cyan-400', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]' },
  'الكل': { icon: LayoutGrid, ring: 'border-neon-purple/30 group-hover:border-neon-purple', glow: 'group-hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]' }
};

const SimpleRating = ({ rating, count }: { rating?: number | null; count?: number | null }) => {
  const safeRating = typeof rating === 'number' && !Number.isNaN(rating) ? rating : 0;

  if (safeRating === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/5 bg-black/20 text-white/90">
      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
      <span className="text-xs font-bold tabular-nums tracking-wider">{safeRating.toFixed(1)}</span>
    </div>
  );
};

const ToolCard = memo(({ tool, index = 0 }: ToolCardProps) => {
  const prefetchTool = usePrefetchTool();
  const { recordClick } = useClickTracking();
  const { selectedTools, addToCompare, removeFromCompare } = useCompare();

  const isCompared = selectedTools.includes(String(tool.id));

  const displayTitle = tool.title;
  const displayDescription = tool.description;

  // Fallbacks logic
  let extractedCategoryKey = 'الكل';
  if (tool.category) {
    if (tool.category.includes('نصوص')) extractedCategoryKey = 'نصوص';
    else if (tool.category.includes('صور')) extractedCategoryKey = 'صور';
    else if (tool.category.includes('فيديو')) extractedCategoryKey = 'فيديو';
    else if (tool.category.includes('برمجة')) extractedCategoryKey = 'برمجة';
    else if (tool.category.includes('إنتاجية')) extractedCategoryKey = 'إنتاجية';
    else if (tool.category.includes('صوت')) extractedCategoryKey = 'صوت';
  }

  const aesthetic = categoryAesthetics[extractedCategoryKey] || categoryAesthetics['الكل'];
  const CategoryIcon = aesthetic.icon;

  const isSponsored = tool.is_sponsored === true;
  const supportsArabic = tool.supports_arabic === true;
  const pricingTier = getPricingTier(tool.pricing_type);

  // Newness check
  const isNew = useMemo(() => {
    if (!tool.created_at) return false;
    const daysSinceCreation = Math.floor((Date.now() - new Date(tool.created_at).getTime()) / (1000 * 60 * 60 * 24));
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

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // let the link handle navigation, but ensure we don't trigger wrapper clicks if any
    recordClick(String(tool.id));
  };

  const resolvedImageUrl = getToolImageUrl(tool.image_url, tool.url);
  const showResolvedImage = !!resolvedImageUrl;

  return (
    <div
      className={cn(
        "group relative flex flex-col h-full bg-[#0a0a14] rounded-2xl transition-all duration-500 gpu-accelerated overflow-visible",
        "border border-white/5 hover:border-white/20 select-none",
        aesthetic.glow,
        // Slide up stagger animation on mount
        "animate-slide-up opacity-0"
      )}
      onMouseEnter={() => prefetchTool(String(tool.id))}
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms`, animationFillMode: 'forwards' }}
    >
      {/* 
        Abstract Background Layer
        Using pure CSS radial gradients instead of heavy DOM nodes or blurs to save Main Thread execution time.
      */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -end-24 w-48 h-48 bg-white opacity-[0.02] group-hover:opacity-[0.05] rounded-full blur-2xl transition-opacity duration-700" />
        <div className="absolute bottom-0 start-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.015] bg-[url('/noise.png')] mix-blend-overlay" />
      </div>

      {/* Floating Action Buttons (Outside normal flow/absolute) */}
      <div className="absolute top-4 end-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
        <button
          onClick={handleCompareClick}
          className={cn(
            "p-2 rounded-xl backdrop-blur-md transition-all shadow-[0_4px_16px_rgba(0,0,0,0.5)] border",
            isCompared
              ? "bg-neon-purple text-white border-neon-purple/50 glow-purple"
              : "bg-black/60 text-slate-400 hover:text-white border-white/10 hover:border-white/30"
          )}
          title={isCompared ? "إزالة من المقارنة" : "إضافة للمقارنة"}
          aria-label={isCompared ? "إزالة من المقارنة" : "إضافة للمقارنة"}
        >
          <Scale className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-4 start-4 z-20">
        <BookmarkButton
          toolId={String(tool.id)}
          className="bg-black/60 text-slate-400 border border-white/10 hover:border-white/30 rounded-xl p-2 shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
        />
      </div>

      {/* Badges (Top) */}
      <div className={cn("absolute top-0 z-10 flex gap-2 -translate-y-1/2", "start-6")}>
        {isSponsored && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-600 to-orange-500 text-black font-extrabold text-[10px] uppercase tracking-wider shadow-[0_4px_12px_rgba(245,158,11,0.4)]">
            <Crown className="w-3 h-3" strokeWidth={3} /> ممول
          </div>
        )}
        {isNew && !isSponsored && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neon-cyan text-black font-extrabold text-[10px] uppercase tracking-wider shadow-[0_4px_12px_rgba(6,182,212,0.4)]">
            <Sparkles className="w-3 h-3" strokeWidth={3} /> جديد
          </div>
        )}
      </div>

      {/* Main Content Area (Clickable) */}
      <Link
        to={`/tool/${tool.id}`}
        className="flex flex-col flex-grow p-5 sm:p-6 z-10 focus-visible:outline-none focus:ring-2 focus:ring-neon-purple/50 rounded-2xl"
        aria-label={`تصفح أداة ${displayTitle}`}
      >
        {/* Header: Identity Group */}
        <div className="flex gap-4 items-start mb-5 mt-2">

          {/* Asymmetric Avatar Placement */}
          <div className={cn(
            "relative shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center p-0.5 transition-transform duration-500 group-hover:scale-[1.05] group-hover:-rotate-2 bg-[#05050a]",
            "border", aesthetic.ring,
            "shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
          )}>
            <div className="w-full h-full rounded-xl overflow-hidden bg-white/[0.02] flex items-center justify-center relative">
              {showResolvedImage ? (
                <ImageWithFallback
                  src={resolvedImageUrl}
                  alt={displayTitle}
                  width={160}
                  className="w-full h-full p-2 object-contain"
                  priority={index < 6}
                  aspectRatio="square"
                />
              ) : (
                <CategoryIcon className={cn("w-6 h-6 opacity-60", aesthetic.ring.split(' ')[0].replace('border-', 'text-'))} />
              )}
            </div>
          </div>

          {/* Title & Micro-metrics */}
          <div className="flex flex-col pt-1">
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors line-clamp-1 leading-tight mb-1.5">
              {displayTitle}
            </h3>
            <SimpleRating rating={tool.average_rating} count={tool.reviews_count} />
          </div>
        </div>

        {/* Description: High legibility formatting */}
        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2 max-w-[95%] group-hover:text-slate-300 transition-colors">
          {displayDescription}
        </p>

        {/* Metadata Badges: Semantic styling without generic badge borders */}
        <div className="flex flex-wrap gap-2 mt-auto mb-5">
          <span className="px-2 py-1 text-xs font-semibold rounded-md bg-white/5 text-slate-300 border border-white/5">
            {getCategoryLabel(tool.category, true)}
          </span>
          <span className={cn(
            "px-2 py-1 text-xs font-bold rounded-md border",
            pricingTier === 'free' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
              pricingTier === 'paid' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                pricingTier === 'trial' || pricingTier === 'freemium' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                  'bg-slate-800 text-slate-400 border-slate-700'
          )}>
            {getPricingLabel(tool.pricing_type, true)}
          </span>
          {supportsArabic && (
            <span className="px-2 py-1 text-xs font-semibold rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1">
              <Languages className="w-3 h-3" /> عربي
            </span>
          )}
        </div>
      </Link>

      {/* Action Footer: Integrated organically, not sectioned off */}
      <div className="z-10 px-5 pb-5 pt-0">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleActionClick}
          className={cn(
            "flex w-full items-center justify-between px-4 py-3 rounded-xl transition-all duration-300",
            "bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.05] group-hover:border-white/10 text-slate-400 group-hover:text-white"
          )}
          aria-label={`تفضل بزيارة ${displayTitle}`}
        >
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5 text-slate-500 group-hover:text-neon-purple transition-colors" />
            زيارة
          </span>
          <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:-translate-y-0.5 rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5 transition-all" />
        </a>
      </div>

    </div>
  );
});

ToolCard.displayName = 'ToolCard';

export default ToolCard;
