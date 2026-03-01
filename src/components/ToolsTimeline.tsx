import { useMemo, useRef, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import ToolCard from "./ToolCard";
import type { Tool } from "@/hooks/useTools";
import { CalendarDays, Loader2, Sparkles } from "lucide-react";

dayjs.locale("ar");

interface ToolsTimelineProps {
  tools: Tool[];
  onFetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
}

interface TimelineGroup {
  key: string;
  sortValue: number;
  items: Tool[];
}

const ToolsTimeline = ({ tools, onFetchNextPage, hasNextPage, isFetchingNextPage }: ToolsTimelineProps) => {
  const timelineGroups = useMemo(() => {
    const groupsMap = new Map<string, TimelineGroup>();

    tools.forEach((tool) => {
      const dateStr = tool.release_date || tool.created_at;
      const date = dayjs(dateStr);

      let groupKey = "أدوات أخرى";
      let sortValue = 0;

      if (dateStr && date.isValid()) {
        groupKey = date.format("MMMM YYYY");
        sortValue = date.startOf("month").valueOf();
      }

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, {
          key: groupKey,
          sortValue,
          items: [],
        });
      }

      groupsMap.get(groupKey)!.items.push(tool);
    });

    return Array.from(groupsMap.values()).sort((a, b) => b.sortValue - a.sortValue);
  }, [tools]);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          onFetchNextPage?.();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    observer.observe(currentTarget);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onFetchNextPage]);

  if (!tools.length && !isFetchingNextPage) {
    return (
      <div className="animate-fade-in py-20 text-center text-muted-foreground">
        <p className="text-lg">لا توجد أدوات متاحة حاليًا.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-12 pb-10" dir="rtl">
      <div className="absolute bottom-0 top-0 hidden w-[2px] bg-gradient-to-b from-neon-purple/50 via-neon-blue/20 to-transparent opacity-50 shadow-[0_0_10px_rgba(139,92,246,0.2)] md:block md:right-8" />

      {timelineGroups.map((group, groupIndex) => (
        <div
          key={group.key}
          className="relative z-10 animate-fade-in"
          style={{ animationDelay: `${groupIndex * 0.1}s` }}
        >
          <div className="sticky top-[80px] z-20 mb-8 flex items-center">
            <div className="absolute hidden -translate-x-1/2 items-center justify-center md:flex md:right-8">
              <div className="relative z-10 h-5 w-5 rounded-full border-2 border-neon-purple bg-[#0f0f1a] shadow-[0_0_15px_rgba(139,92,246,0.8)]">
                <div className="absolute inset-0 rounded-full bg-neon-purple opacity-30 animate-ping" />
                <div className="absolute inset-0 rounded-full bg-neon-purple opacity-20 blur-sm" />
              </div>
            </div>

            <div className="mr-0 flex items-center gap-3 rounded-full border border-white/20 bg-[#0f0f1a]/85 px-6 py-2.5 shadow-lg ring-1 ring-white/10 backdrop-blur-xl transition-all hover:border-neon-purple/50 hover:shadow-neon-purple/20 group md:mr-16">
              <CalendarDays className="h-5 w-5 text-neon-purple transition-transform duration-300 group-hover:scale-110" />
              <h2 className="text-lg font-bold tracking-wide text-white">{group.key}</h2>
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full border border-neon-purple/80 bg-neon-purple/60 px-2 text-xs font-semibold text-white">
                {group.items.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 pl-4 pr-0 md:grid-cols-2 md:pr-16 lg:grid-cols-3">
            {group.items.map((tool, index) => (
              <ToolCard key={`${tool.id}-${group.key}-${index}`} tool={tool} index={index} />
            ))}
          </div>
        </div>
      ))}

      <div ref={observerTarget} className="flex min-h-[100px] flex-col items-center justify-center gap-4 py-12">
        {isFetchingNextPage ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-6">
            <Loader2 className="h-8 w-8 animate-spin text-neon-purple" />
            <p className="text-sm text-slate-400 animate-pulse">جارٍ تحميل المزيد من البيانات...</p>
          </div>
        ) : hasNextPage ? (
          <span className="text-xs tracking-wide text-slate-300">مرّر للمزيد</span>
        ) : (
          <div className="animate-in zoom-in-50 duration-500 flex flex-col items-center gap-4">
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-transparent via-neon-purple to-transparent opacity-50" />
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0f0f1a] px-6 py-3 text-sm text-slate-400 shadow-lg">
              <Sparkles className="h-4 w-4 text-neon-cyan" />
              <span>اكتمل الأرشيف. تم عرض {tools.length} أداة.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsTimeline;
