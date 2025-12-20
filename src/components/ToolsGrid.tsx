import ToolCard from './ToolCard';
import type { Tool } from '@/data/tools';

interface ToolsGridProps {
  tools: Tool[];
}

const ToolsGrid = ({ tools }: ToolsGridProps) => {
  if (tools.length === 0) {
    return (
      <div className="text-center py-20" dir="rtl">
        <p className="text-2xl text-muted-foreground">لم يتم العثور على أدوات مطابقة</p>
        <p className="text-muted-foreground mt-2">جرب البحث بكلمات مختلفة</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 pb-20">
      {tools.map((tool, index) => (
        <ToolCard key={tool.id} tool={tool} index={index} />
      ))}
    </div>
  );
};

export default ToolsGrid;
