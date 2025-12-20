import ToolCard from './ToolCard';
import type { Tool } from '@/hooks/useTools';
import { Loader2 } from 'lucide-react';

interface ToolsGridProps {
  tools: Tool[];
  isLoading?: boolean;
  error?: Error | null;
}

const ToolsGrid = ({ tools, isLoading, error }: ToolsGridProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20" dir="rtl">
        <Loader2 className="h-12 w-12 animate-spin text-neon-purple" />
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
      <div className="text-center py-20" dir="rtl">
        <p className="text-2xl text-muted-foreground">لم يتم العثور على أدوات مطابقة</p>
        <p className="text-muted-foreground mt-2">جرب البحث بكلمات مختلفة</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 px-4 pb-20">
      {tools.map((tool, index) => (
        <ToolCard key={tool.id} tool={tool} index={index} />
      ))}
    </div>
  );
};

export default ToolsGrid;
