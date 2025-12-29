import { useEffect, useState } from 'react';
import ToolRow from './ToolRow';
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

/**
 * ToolsGrid - عرض قائمة الأدوات (List View)
 * 
 * التحسينات:
 * - List بدلاً من Grid = عناصر DOM أقل
 * - ToolRow خفيف (~10 عناصر) بدلاً من ToolCard (~25 عنصر)
 * - أداء أفضل على الجوال
 * - TBT أقل
 */
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
      <div className="flex justify-center items-center py-20" dir="rtl">
        <Loader2 className="h-10 w-10 animate-spin text-neon-purple" />
        <span className="sr-only">جاري تحميل الأدوات...</span>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="text-center py-16" dir="rtl">
        <p className="text-xl text-destructive">حدث خطأ في تحميل البيانات</p>
        <p className="text-muted-foreground mt-2">يرجى المحاولة مرة أخرى</p>
      </div>
    );
  }

  // Empty State
  if (tools.length === 0) {
    return (
      <>
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announcement}
        </div>
        <div className="text-center py-16" dir="rtl">
          <p className="text-xl text-muted-foreground">لم يتم العثور على أدوات مطابقة</p>
          <p className="text-muted-foreground mt-2">جرب البحث بكلمات مختلفة</p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Accessibility Announcement */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Tools List (Column Layout) */}
      <div className="flex flex-col gap-3 px-2 sm:px-4 pb-6" role="list">
        {tools.map((tool) => (
          <ToolRow key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center pb-12">
          <Button
            onClick={() => onFetchNextPage?.()}
            disabled={isFetchingNextPage}
            variant="outline"
            size="lg"
            className="bg-card/50 border-neon-purple/30 hover:bg-card text-foreground min-w-[180px]"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التحميل...
              </>
            ) : (
              'تحميل المزيد'
            )}
          </Button>
        </div>
      )}
    </>
  );
};

export default ToolsGrid;
