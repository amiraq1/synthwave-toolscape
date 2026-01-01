import { useEffect, useState } from 'react';
import ToolCard from './ToolCard';
import type { Tool } from '@/hooks/useTools';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  useEffect(() => {
    if (isLoading) return;

    const count = tools.length;
    let message = '';

    if (searchQuery && activeCategory !== 'الكل') {
      message = count === 0
        ? `لا توجد نتائج للبحث "${searchQuery}" في فئة ${activeCategory}`
        : `تم العثور على ${count} أداة للبحث "${searchQuery}" في فئة ${activeCategory}`;
    } else if (searchQuery) {
      message = count === 0
        ? `لا توجد نتائج للبحث "${searchQuery}"`
        : `تم العثور على ${count} أداة للبحث "${searchQuery}"`;
    } else if (activeCategory !== 'الكل') {
      message = count === 0
        ? `لا توجد أدوات في فئة ${activeCategory}`
        : `عرض ${count} أداة في فئة ${activeCategory}`;
    } else {
      message = `عرض ${count} أداة`;
    }

    setAnnouncement(message);
  }, [tools.length, searchQuery, activeCategory, isLoading]);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[400px]" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-neon-purple" />
          <span className="text-muted-foreground animate-pulse">جاري تحميل الأدوات...</span>
        </div>
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
        <p className="text-xl font-bold text-destructive mb-2">حدث خطأ في تحميل البيانات</p>
        <p className="text-muted-foreground">يرجى التحقق من الاتصال والمحاولة مرة أخرى</p>
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
          <p className="text-xl font-semibold text-foreground">لم يتم العثور على أدوات</p>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            جرب البحث بكلمات مختلفة أو تغيير التصنيف المختار.
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
                جاري التحميل...
              </>
            ) : (
              'عرض المزيد من الأدوات'
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default ToolsGrid;
