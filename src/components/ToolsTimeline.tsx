import { useMemo, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import ToolCard from './ToolCard';
import type { Tool } from '@/hooks/useTools';
import { CalendarDays, Loader2, Sparkles } from 'lucide-react';

dayjs.locale('en');

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

            let groupKey = "Other Tools";
            let sortValue = 0;

            if (dateStr && date.isValid()) {
                groupKey = date.format('MMMM YYYY');
                sortValue = date.startOf('month').valueOf();
            }

            if (!groupsMap.has(groupKey)) {
                groupsMap.set(groupKey, {
                    key: groupKey,
                    sortValue: sortValue,
                    items: []
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
            { threshold: 0.1, rootMargin: '100px' }
        );

        observer.observe(currentTarget);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, onFetchNextPage]);

    if (!tools.length && !isFetchingNextPage) {
        return (
            <div className="text-center py-20 text-muted-foreground animate-fade-in">
                <p className="text-lg">No tools available right now.</p>
            </div>
        );
    }

    return (
        <div className="relative space-y-12 pb-10" dir="ltr">

            {/* Avant-Garde Timeline Line */}
            <div className="absolute top-0 bottom-0 left-6 md:left-8 w-[2px] bg-gradient-to-b from-neon-purple/50 via-neon-blue/20 to-transparent hidden md:block opacity-50 shadow-[0_0_10px_rgba(139,92,246,0.2)]" />

            {timelineGroups.map((group, groupIndex) => (
                <div
                    key={group.key}
                    className="relative z-10 animate-fade-in"
                    style={{ animationDelay: `${groupIndex * 0.1}s` }}
                >

                    {/* Timeline Node & Header */}
                    <div className="sticky top-[80px] z-20 mb-8 flex items-center">

                        {/* Glowing Node */}
                        <div className="hidden md:flex items-center justify-center absolute left-6 md:left-8 -translate-x-1/2">
                            <div className="w-5 h-5 rounded-full bg-[#0f0f1a] border-2 border-neon-purple shadow-[0_0_15px_rgba(139,92,246,0.8)] relative z-10">
                                <div className="absolute inset-0 bg-neon-purple rounded-full animate-ping opacity-30" />
                                <div className="absolute inset-0 bg-neon-purple rounded-full opacity-20 blur-sm" />
                            </div>
                        </div>

                        {/* Date Capsule */}
                        <div className="flex items-center gap-3 bg-[#0f0f1a]/85 backdrop-blur-xl border border-white/20 px-6 py-2.5 rounded-full shadow-lg ml-0 md:ml-16 transition-all hover:border-neon-purple/50 hover:shadow-neon-purple/20 group ring-1 ring-white/10">
                            <CalendarDays className="w-5 h-5 text-neon-purple group-hover:scale-110 transition-transform duration-300" />
                            <h2 className="text-lg font-bold text-white capitalize tracking-wide font-mono">
                                {group.key}
                            </h2>
                            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-neon-purple/60 border border-neon-purple/80 px-2 text-xs font-semibold text-white">
                                {group.items.length}
                            </span>
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pl-0 md:pl-16 pr-4">
                        {group.items.map((tool, index) => (
                            <ToolCard
                                key={tool.id}
                                tool={tool}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {/* Loading & End States */}
            <div ref={observerTarget} className="py-12 flex flex-col items-center justify-center gap-4 min-h-[100px]">
                {isFetchingNextPage ? (
                    <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/5 border border-white/5">
                        <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
                        <p className="text-slate-400 text-sm animate-pulse font-mono">Loading more data...</p>
                    </div>
                ) : hasNextPage ? (
                    <span className="text-slate-300 text-xs uppercase tracking-widest">Scroll for more</span>
                ) : (
                    <div className="flex flex-col items-center gap-4 animate-in zoom-in-50 duration-500">
                        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-neon-purple to-transparent rounded-full opacity-50" />
                        <div className="flex items-center gap-2 text-slate-400 text-sm bg-[#0f0f1a] border border-white/10 px-6 py-3 rounded-full shadow-lg">
                            <Sparkles className="w-4 h-4 text-neon-cyan" />
                            <span>Archive complete. Displayed {tools.length} tools.</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolsTimeline;
