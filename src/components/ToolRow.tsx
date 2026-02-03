
import { memo, useState, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronLeft, Type, Image as ImageIcon, Video, Code, Zap, Sparkles, LucideIcon, ChevronRight } from 'lucide-react';
import BookmarkButton from './BookmarkButton';
import type { Tool } from '@/hooks/useTools';
import { usePrefetchTool } from '@/hooks/useTool';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { isValidImageUrl } from '@/utils/imageUrl';
import { useFavicon } from '@/hooks/useFavicon';

interface ToolRowProps {
    tool: Tool;
}

// Category gradient mapping
const categoryGradients: Record<string, string> = {
    'نصوص': 'from-emerald-500/20 to-teal-600/20 text-emerald-400',
    'صور': 'from-purple-500/20 to-pink-600/20 text-purple-400',
    'فيديو': 'from-blue-500/20 to-cyan-600/20 text-blue-400',
    'برمجة': 'from-gray-600/20 to-gray-800/20 text-gray-300',
    'إنتاجية': 'from-amber-500/20 to-yellow-600/20 text-amber-400',
};

// Category icons mapping
const categoryIcons: Record<string, LucideIcon> = {
    'نصوص': Type,
    'صور': ImageIcon,
    'فيديو': Video,
    'برمجة': Code,
    'إنتاجية': Zap,
    'الكل': Sparkles,
};

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
    const [imageError, setImageError] = useState(false);
    const [faviconError, setFaviconError] = useState(false);
    const { i18n } = useTranslation();
    const isAr = i18n.language === 'ar';
    const faviconSrc = useFavicon(tool.url);

    // Category styling
    const categoryStyle = categoryGradients[tool.category] || 'from-neon-purple/20 to-neon-blue/20 text-neon-purple';
    const CategoryIcon = categoryIcons[tool.category] || Sparkles;

    // Content Display
    const displayTitle = isAr ? tool.title : (tool.title_en || tool.title);
    const displayDescription = isAr ? tool.description : (tool.description_en || tool.description);

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

    // Determine which icon layer to show
    const validImageUrl = isValidImageUrl(tool.image_url) ? tool.image_url : null;
    const hasValidImage = !!validImageUrl && !imageError;
    const hasValidFavicon = !!faviconSrc && !faviconError;
    const showCategoryIcon = !hasValidImage && !hasValidFavicon;

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
            dir={isAr ? "rtl" : "ltr"}
            aria-label={isAr ? `عرض تفاصيل ${displayTitle}` : `View details for ${displayTitle}`}
        >
            {/* Icon/Logo - Glassmorphism Style with 3-layer fallback */}
            <div
                className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                    "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10",
                    "transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-white/5",
                    showCategoryIcon && `bg-gradient-to-br ${categoryStyle.split(' ')[0]} ${categoryStyle.split(' ')[1]}`
                )}
            >
                {hasValidImage ? (
                    <img
                        src={validImageUrl!}
                        alt=""
                        width={48}
                        height={48}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full p-1.5 rounded-2xl object-contain"
                        onError={() => setImageError(true)}
                    />
                ) : hasValidFavicon ? (
                    <img
                        src={faviconSrc!}
                        alt=""
                        width={32}
                        height={32}
                        loading="lazy"
                        decoding="async"
                        className="w-8 h-8 rounded-lg object-contain"
                        onError={() => setFaviconError(true)}
                    />
                ) : (
                    <CategoryIcon className={cn("w-6 h-6 opacity-80", categoryStyle.split(' ')[2])} />
                )}
            </div>

            {/* Content */}
            <div className={`flex-1 min-w-0 ${!isAr ? "text-left" : ""}`}>
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
                {isAr ? (
                    <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-neon-purple transition-colors shrink-0" />
                ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-neon-purple transition-colors shrink-0" />
                )}
            </div>
        </div>
    );
});

ToolRow.displayName = 'ToolRow';

export default ToolRow;
