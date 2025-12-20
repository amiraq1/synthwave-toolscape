import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Tool } from '@/hooks/useTools';
import { cn } from '@/lib/utils';
import AverageRating from './AverageRating';

interface ToolCardProps {
  tool: Tool;
  index: number;
}

// Category gradient mapping
const categoryGradients: Record<string, string> = {
  'نصوص': 'from-emerald-500 to-teal-600',
  'صور': 'from-purple-500 to-pink-600',
  'فيديو': 'from-blue-500 to-cyan-600',
  'برمجة': 'from-gray-600 to-gray-800',
  'إنتاجية': 'from-amber-500 to-yellow-600',
};

const ToolCard = ({ tool, index }: ToolCardProps) => {
  const navigate = useNavigate();
  const gradient = categoryGradients[tool.category] || 'from-neon-purple to-neon-blue';

  const handleCardClick = () => {
    navigate(`/tool/${tool.id}`);
  };

  const handleVisitClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <article
      onClick={handleCardClick}
      className="glass rounded-2xl p-4 sm:p-6 card-glow animate-fade-in cursor-pointer transition-transform hover:scale-[1.02] touch-manipulation group"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      dir="rtl"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Icon */}
        <div className={cn(
          "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shrink-0",
          "bg-white/10 backdrop-blur-sm",
          "border border-white/20",
          "shadow-lg shadow-black/10",
          "overflow-hidden",
          "transition-transform duration-300 ease-out group-hover:scale-110",
          !tool.image_url && `bg-gradient-to-br ${gradient}`
        )}>
          {tool.image_url ? (
            <img 
              src={tool.image_url} 
              alt={tool.title}
              loading="lazy"
              className="w-full h-full object-contain p-1.5 bg-white/90 dark:bg-white/95"
            />
          ) : '🤖'}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-xl font-bold text-foreground truncate">{tool.title}</h3>
            <AverageRating toolId={tool.id} size="sm" />
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2">{tool.description}</p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between mt-4 sm:mt-6 gap-2">
        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
          <Badge variant="secondary" className="bg-neon-purple/20 text-neon-purple border-neon-purple/30 text-xs sm:text-sm px-2 sm:px-3">
            {tool.category}
          </Badge>
          <Badge 
            variant="secondary" 
            className={cn(
              "border text-xs sm:text-sm px-2 sm:px-3",
              tool.pricing_type === 'مجاني' 
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            )}
          >
            {tool.pricing_type}
          </Badge>
        </div>
        
        <Button
          asChild
          size="sm"
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity gap-1.5 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 touch-manipulation"
          onClick={handleVisitClick}
        >
          <a href={tool.url} target="_blank" rel="noopener noreferrer">
            <span className="hidden xs:inline">زيارة الموقع</span>
            <span className="xs:hidden">زيارة</span>
            <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </a>
        </Button>
      </div>
    </article>
  );
};

export default ToolCard;
