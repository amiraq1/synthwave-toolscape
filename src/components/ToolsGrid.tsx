import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ToolCard from './ToolCard';
import type { Tool } from '@/hooks/useTools';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolCardSkeleton } from '@/components/skeletons/ToolCardSkeleton';

interface ToolsGridProps {
  tools: Tool[];
  isLoading?: boolean;
  error?: Error | null;
  searchQuery?: string;
  activeCategory?: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage?: () => void;
}

const ToolsGrid = ({
  tools,
  isLoading,
  error,
  searchQuery = '',
  activeCategory = 'الكل',
  hasNextPage,
  isFetchingNextPage,
  onFetchNextPage
}: ToolsGridProps) => {
  const [announcement, setAnnouncement] = useState('');
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (isLoading) return;

    const count = tools.length;
    let message = '';

    if (searchQuery && activeCategory !== 'الكل') {
      message = count === 0
        ? t('toolsGrid.no_results_category', { query: searchQuery, category: activeCategory })
        : t('toolsGrid.found_results_category', { count, query: searchQuery, category: activeCategory });
    } else if (searchQuery) {
      message = count === 0
        ? t('toolsGrid.no_results', { query: searchQuery })
        : t('toolsGrid.found_results', { count, query: searchQuery });
    } else if (activeCategory !== 'الكل') {
      message = count === 0
        ? t('toolsGrid.empty_category', { category: activeCategory })
        : t('toolsGrid.showing_category', { count, category: activeCategory });
    } else {
      message = t('toolsGrid.showing_all', { count });
    }

    setAnnouncement(message);
  }, [tools.length, searchQuery, activeCategory, isLoading]);

  // Loading State
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 px-1 sm:px-4 pb-8" dir="rtl">
        {Array.from({ length: 6 }).map((_, i) => (
          <ToolCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="text-center py-20 min-h-[400px] flex flex-col justify-center items-center" dir="rtl">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <Loader2 className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-xl font-bold text-destructive mb-2">
          {t('toolsGrid.error_title')}
        </p>
        <p className="text-muted-foreground">
          {t('toolsGrid.error_desc')}
        </p>
      </div>
    );
  }

  // Empty State
  if (tools.length === 0) {
    return (
      <>
        <div role="status" aria-live="polite" className="sr-only">
          {announcement}
        </div>
        <div className="text-center py-20 min-h-[400px] flex flex-col justify-center items-center" dir="rtl">
          <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4 text-3xl grayscale opacity-50">
            🔍
          </div>
          <p className="text-xl font-semibold text-foreground">
            {t('toolsGrid.not_found_title')}
          </p>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            {t('toolsGrid.not_found_desc')}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 px-1 sm:px-4 pb-8"
        role="list"
        dir="rtl"
      >
        {tools.map((tool, index) => (
          <ToolCard key={tool.id} tool={tool} index={index} />
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center pb-16 pt-4">
          <Button
            onClick={() => onFetchNextPage?.()}
            disabled={isFetchingNextPage}
            variant="outline"
            size="lg"
            className="
              bg-card/30 backdrop-blur-sm border-white/10 
              hover:bg-neon-purple/10 hover:border-neon-purple/50 hover:text-neon-purple
              transition-all duration-300 min-w-[200px] h-12 text-base font-medium shadow-lg
            "
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                {t('toolsGrid.loading_more')}
              </>
            ) : (
              t('toolsGrid.load_more')
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default ToolsGrid;
