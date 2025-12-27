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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20" dir="rtl">
        <Loader2 className="h-12 w-12 animate-spin text-neon-purple" />
        <span className="sr-only">جاري تحميل الأدوات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20" dir="rtl">
        <p className="text-2xl text-destructive">حدث خطأ في تحميل البيانات</p>
        <p className="text-muted-foreground mt-2">يرجى المحاولة مرة أخرى</p>
      </div>
    );
  }

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
        <div className="text-center py-20" dir="rtl">
          <p className="text-2xl text-muted-foreground">لم يتم العثور على أدوات مطابقة</p>
          <p className="text-muted-foreground mt-2">جرب البحث بكلمات مختلفة</p>
        </div>
      </>
    );
  }

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4 pb-8">
        {tools.map((tool, index) => (
          <ToolCard key={tool.id} tool={tool} index={index} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pb-20">
          <Button
            onClick={() => onFetchNextPage?.()}
            disabled={isFetchingNextPage}
            variant="outline"
            size="lg"
            className="bg-white/5 border-neon-purple/20 hover:bg-white/10 text-foreground min-w-[200px]"
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
