import { memo, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronLeft } from 'lucide-react';
import BookmarkButton from './BookmarkButton';
import type { Tool } from '@/hooks/useTools';
import { usePrefetchTool } from '@/hooks/useTool';
import ToolLogo from './ToolLogo';

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
 * - نظام أيقونات ذكي ثلاثي المستويات
 */
const ToolRow = memo(({ tool }: ToolRowProps) => {
    const navigate = useNavigate();
    const prefetchTool = usePrefetchTool();

    // Content Display
    const displayTitle = tool.title;
    const displayDescription = tool.description;

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
    const shortDesc = displayDescription
        ? displayDescription.slice(0, 100) + (displayDescription.length > 100 ? '...' : '')
        : '';

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
        }
    };

    return (
        <div
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onKeyDown={onKeyDown}
            role="button"
            tabIndex={0}
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
            aria-label={`عرض تفاصيل ${displayTitle}`}
        >
            <ToolLogo
                title={displayTitle}
                imageUrl={tool.image_url}
                category={tool.category}
                toolUrl={tool.url}
                size="md"
                className="transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-white/5"
            />

            {/* Content */}
            <div className={`flex-1 min-w-0`}>
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-foreground truncate">{displayTitle}</h3>
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
            <div className="flex items-center gap-2">
                <BookmarkButton toolId={tool.id} className="h-8 w-8 rounded-full" />
                <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-neon-purple transition-colors shrink-0" />
            </div>
        </div>
    );
});

ToolRow.displayName = 'ToolRow';

export default ToolRow;
