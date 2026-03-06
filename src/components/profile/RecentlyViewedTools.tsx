import { useEffect, useState } from "react";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ToolCard from "@/components/ToolCard";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import type { Tool } from "@/hooks/useTools";

const RecentlyViewedTools = () => {
  const { recentIds, clearRecent, hasRecent } = useRecentlyViewed();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTools = async () => {
      if (!hasRecent) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("tools")
          .select("*")
          .in("id", recentIds.map(Number));

        if (data) {
          const orderedTools = recentIds
            .map((id) => {
              const found = data.find((tool) => String(tool.id) === id);
              if (!found) return null;
              return {
                ...found,
                id: String(found.id),
                features: found.features || [],
              } as Tool;
            })
            .filter((tool): tool is Tool => tool !== null);

          setTools(orderedTools);
        }
      } catch (error) {
        console.error("Error fetching recent tools:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchTools();
  }, [hasRecent, recentIds]);

  if (!hasRecent) {
    return (
      <div className="editorial-soft-card py-16 text-center">
        <Clock className="mx-auto mb-4 h-12 w-12 text-slate-400" />
        <p className="mb-2 text-slate-700">لا توجد أدوات مشاهدة مؤخراً</p>
        <p className="text-sm text-slate-500">
          عند زيارتك لأي أداة، ستظهر هنا
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="editorial-soft-card h-64 animate-pulse bg-white/55"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">آخر {tools.length} أداة شاهدتها</p>
        <Button
          variant="outline"
          size="sm"
          onClick={clearRecent}
          className="rounded-full border-black/10 bg-white/70 text-slate-700 hover:bg-white hover:text-red-600"
        >
          <Trash2 className="me-2 h-4 w-4" />
          مسح السجل
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewedTools;
