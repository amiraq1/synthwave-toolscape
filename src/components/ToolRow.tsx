import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronLeft } from 'lucide-react';
import type { Tool } from '@/hooks/useTools';
import { usePrefetchTool } from '@/hooks/useTool';

interface ToolRowProps {
    tool: Tool;
}

/**
 * ToolRow - مكون عرض أداة بشكل صف (List View)
 * 
 * مميزات:
 * - عناصر DOM أقل (~10 بدلاً من ~25)
 * - أداء أفضل على الجوال
 * - مساحة لمس مناسبة (48px+)
 * - Prefetch عند Hover
 */
const ToolRow = memo(({ tool }: ToolRowProps) => {
    const navigate = useNavigate();
    const prefetchTool = usePrefetchTool();

    const handleClick = () => {
        navigate(`/tool/${tool.id}`);
    };

    const handleMouseEnter = () => {
        prefetchTool(tool.id);
    };

    // Safe rating values (متوافقة مع ToolCard)
    const rating = typeof tool.average_rating === 'number' && !Number.isNaN(tool.average_rating)
        ? tool.average_rating.toFixed(1)
        : '0.0';
    const reviewCount = typeof tool.reviews_count === 'number' ? tool.reviews_count : 0;

    // Truncate description
    const shortDesc = tool.description
        ? tool.description.slice(0, 100) + (tool.description.length > 100 ? '...' : '')
        : '';

    return (
        <button
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            className="
        w-full text-right
        flex items-center gap-4 p-4
        bg-card/50 hover:bg-card/80
        border border-border/30 hover:border-neon-purple/30
        rounded-xl
        transition-colors duration-200
        min-h-[72px]
        group
      "
            dir="rtl"
            aria-label={`عرض تفاصيل ${tool.title}`}
        >
            {/* Icon/Logo */}
            <div
                className="w-12 h-12 rounded-xl bg-muted/30 border border-white/5 shadow-inner flex items-center justify-center shrink-0
                           transition-transform duration-200 group-hover:scale-105"
            >
                {tool.image_url ? (
                    <img
                        src={tool.image_url}
                        alt=""
                        width={48}
                        height={48}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full p-1.5 rounded-xl object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <span className="text-xl opacity-80">🤖</span>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground truncate">{tool.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                        {tool.category}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {shortDesc}
                </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 text-sm shrink-0">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold tabular-nums">{rating}</span>
                <span className="text-muted-foreground/60 hidden sm:inline">({reviewCount})</span>
            </div>

            {/* Arrow */}
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-neon-purple transition-colors shrink-0" />
        </button>
    );
});

ToolRow.displayName = 'ToolRow';

export default ToolRow;
