import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Tool } from '@/hooks/useTools';
import { cn } from '@/lib/utils';
import LazyImage from './LazyImage';

interface ToolCardProps {
  tool: Tool;
  index: number;
}

// Category gradient mapping (simplified for better contrast)
const categoryGradients: Record<string, string> = {
  'نصوص': 'from-emerald-500/20 to-teal-600/20 text-emerald-400',
  'صور': 'from-purple-500/20 to-pink-600/20 text-purple-400',
  'فيديو': 'from-blue-500/20 to-cyan-600/20 text-blue-400',
  'برمجة': 'from-gray-600/20 to-gray-800/20 text-gray-300',
  'إنتاجية': 'from-amber-500/20 to-yellow-600/20 text-amber-400',
};

// Simplified Rating Component for cleaner look
HEAD
const SimpleRating = ({ rating, count }: { rating?: number | null; count?: number | null }) => (
  <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5">
    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
    <span className="text-sm font-semibold tabular-nums text-foreground">{rating?.toFixed(1) ?? "0.0"}</span>
    <span className="text-xs text-muted-foreground/60 hidden sm:inline">({count || 0})</span>
  </div>
);

const SimpleRating = ({ rating, count }: { rating?: number | null; count?: number | null }) => {
  const safeRating = typeof rating === 'number' && !Number.isNaN(rating) ? rating : 0;
  const safeCount = typeof count === 'number' && !Number.isNaN(count) ? count : 0;
e1c3c245d550f0d3801ffb13f0fc5d51621863f9

  return (
    <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      <span className="text-sm font-semibold tabular-nums text-foreground">{safeRating.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground/60 hidden sm:inline">({safeCount})</span>
    </div>
  );
};
const ToolCard = ({ tool, index }: ToolCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  // Choose styles based on category
  const categoryStyle = categoryGradients[tool.category] || 'from-neon-purple/20 to-neon-blue/20 text-neon-purple';

  const handleCardClick = () => {
    navigate(`/tool/${tool.id}`);
  };

  const handleVisitClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const showFallback = !tool.image_url || imageError;

  return (
    <article
      onClick={handleCardClick}
      className="glass-card flex flex-col h-full rounded-xl p-5 card-glow cursor-pointer group relative overflow-hidden"
      style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
      dir="rtl"
    >
      {/* Top Section: Icon & Content */}
      <div className="flex items-start gap-4 mb-4">
        {/* Icon Container */}
        <div
          className={cn(
            "w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform duration-300 group-hover:scale-105",
            "bg-muted/30 border border-white/5 shadow-inner",
            showFallback && `bg-gradient-to-br ${categoryStyle.split(' ')[0]} ${categoryStyle.split(' ')[1]}`
          )}
        >
          {!showFallback ? (
            <LazyImage
              src={tool.image_url!}
              alt={tool.title}
              className="w-full h-full p-1.5 rounded-xl object-contain"
              placeholderClassName="bg-muted/50"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="opacity-80">🤖</span>
          )}
        </div>

        {/* Title & Category */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-foreground truncate leading-tight group-hover:text-neon-purple transition-colors">
              {tool.title}
            </h3>
            {tool.is_featured && (
              <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px] shadow-neon-cyan animate-pulse" title="مميز" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium truncate">
            {tool.category}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground/80 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
        {tool.description}
      </p>

      {/* Footer: Rating, Pricing, Action */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
        <div className="flex items-center gap-2">
          <SimpleRating rating={tool.average_rating} count={tool.reviews_count} />
          <Badge
            variant="outline"
            className={cn(
              "text-xs px-2 py-0.5 h-7 font-normal border-white/10 bg-transparent",
              tool.pricing_type === 'مجاني' ? "text-emerald-400" : "text-amber-400"
            )}
          >
            {tool.pricing_type}
          </Badge>
        </div>

        <Button
          asChild
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 rounded-full hover:bg-neon-purple/10 hover:text-neon-purple transition-colors ml-[-4px]"
          onClick={handleVisitClick}
        >
          <a href={tool.url} target="_blank" rel="noopener noreferrer" aria-label={`زيارة ${tool.title}`}>
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </article>
  );
};

export default ToolCard;
