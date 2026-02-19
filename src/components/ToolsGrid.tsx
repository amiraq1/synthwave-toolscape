import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ToolCard from './ToolCard';
import ToolRow from './ToolRow';
import type { Tool } from '@/hooks/useTools';
import { LayoutGrid, List, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToolCardSkeleton } from '@/components/skeletons/ToolCardSkeleton';
import { getCategoryLabel } from '@/utils/localization';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  useEffect(() => {
    const savedMode = window.localStorage.getItem('toolsViewMode');
    if (savedMode === 'grid' || savedMode === 'list') {
      setViewMode(savedMode);
    }
  }, []);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    window.localStorage.setItem('toolsViewMode', mode);
  };

  useEffect(() => {
    if (isLoading) return;

    const count = tools.length;
    const displayCategory = getCategoryLabel(activeCategory, isAr);
    let message = '';

    if (searchQuery && activeCategory !== 'الكل') {
      message = isAr
        ? (count === 0 ? `لا توجد نتائج للبحث "${searchQuery}" في فئة ${displayCategory}` : `تم العثور على ${count} أداة للبحث "${searchQuery}" في فئة ${displayCategory}`)
        : (count === 0 ? `No results for "${searchQuery}" in ${displayCategory}` : `Found ${count} tools for "${searchQuery}" in ${displayCategory}`);
    } else if (searchQuery) {
      message = isAr
        ? (count === 0 ? `لا توجد نتائج للبحث "${searchQuery}"` : `تم العثور على ${count} أداة للبحث "${searchQuery}"`)
        : (count === 0 ? `No results for "${searchQuery}"` : `Found ${count} tools for "${searchQuery}"`);
    } else if (activeCategory !== 'الكل') {
      message = isAr
        ? (count === 0 ? `لا توجد أدوات في فئة ${displayCategory}` : `عرض ${count} أداة في فئة ${displayCategory}`)
        : (count === 0 ? `No tools in ${displayCategory}` : `Showing ${count} tools in ${displayCategory}`);
    } else {
      message = isAr ? `عرض ${count} أداة` : `Showing ${count} tools`;
    }

    setAnnouncement(message);
  }, [tools.length, searchQuery, activeCategory, isLoading, isAr]);

  // Loading State
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 px-1 sm:px-4 pb-8" dir={isAr ? "rtl" : "ltr"}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ToolCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="text-center py-20 min-h-[400px] flex flex-col justify-center items-center" dir={isAr ? "rtl" : "ltr"}>
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <Loader2 className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-xl font-bold text-destructive mb-2">
          {isAr ? "حدث خطأ في تحميل البيانات" : "Error loading data"}
        </p>
        <p className="text-muted-foreground">
          {isAr ? "يرجى التحقق من الاتصال والمحاولة مرة أخرى" : "Please check your connection and try again"}
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
        <div className="text-center py-20 min-h-[400px] flex flex-col justify-center items-center" dir={isAr ? "rtl" : "ltr"}>
          <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4 text-3xl grayscale opacity-50">
            🔍
          </div>
          <p className="text-xl font-semibold text-foreground">
            {isAr ? "لم يتم العثور على أدوات" : "No tools found"}
          </p>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            {isAr ? "جرب البحث بكلمات مختلفة أو تغيير التصنيف المختار." : "Try different keywords or change the selected category."}
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

      <div className={`mb-4 flex items-center justify-end gap-2 ${isAr ? "flex-row-reverse" : ""}`} dir={isAr ? "rtl" : "ltr"}>
        <Button
          type="button"
          variant={viewMode === 'grid' ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => handleViewModeChange('grid')}
          className="gap-2"
          aria-label={isAr ? 'عرض شبكي' : 'Grid view'}
        >
          <LayoutGrid className="h-4 w-4" />
          {isAr ? 'شبكي' : 'Grid'}
        </Button>
        <Button
          type="button"
          variant={viewMode === 'list' ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => handleViewModeChange('list')}
          className="gap-2"
          aria-label={isAr ? 'عرض قائمة' : 'List view'}
        >
          <List className="h-4 w-4" />
          {isAr ? 'قائمة' : 'List'}
        </Button>
      </div>

      {viewMode === 'grid' ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 px-1 sm:px-4 pb-8"
          role="list"
          dir={isAr ? "rtl" : "ltr"}
        >
          {tools.map((tool, index) => (
            <ToolCard key={tool.id} tool={tool} index={index} />
          ))}
        </div>
      ) : (
        <div className="space-y-3 px-1 sm:px-4 pb-8" role="list" dir={isAr ? "rtl" : "ltr"}>
          {tools.map((tool) => (
            <ToolRow key={tool.id} tool={tool} />
          ))}
        </div>
      )}

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
                {isAr ? "جاري التحميل..." : "Loading..."}
              </>
            ) : (
              isAr ? 'عرض المزيد من الأدوات' : 'Load More Tools'
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default ToolsGrid;
