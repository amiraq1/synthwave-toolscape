import { useMemo, useRef, useEffect } from 'react';
import { format, isValid } from 'date-fns';
import { ar } from 'date-fns/locale';
import ToolCard from './ToolCard';
import type { Tool } from '@/hooks/useTools';
import { CalendarDays, Loader2 } from 'lucide-react';

interface ToolsTimelineProps {
    tools: Tool[];
    onFetchNextPage?: () => void;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
}

const ToolsTimeline = ({ tools, onFetchNextPage, hasNextPage, isFetchingNextPage }: ToolsTimelineProps) => {
    // تجميع الأدوات حسب (الشهر سنة)
    const groupedTools = useMemo(() => {
        const groups: Record<string, Tool[]> = {};

        tools.forEach((tool) => {
            // نستخدم release_date أو created_at كبديل
            const dateStr = tool.release_date || tool.created_at;
            // مفتاح التجميع (مثلاً: "يناير 2026")
            let groupKey = "أدوات مميزة";

            if (dateStr) {
                const date = new Date(dateStr);
                if (isValid(date)) {
                    groupKey = format(date, 'MMMM yyyy', { locale: ar });
                }
            }

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(tool);
        });

        return groups;
    }, [tools]);

    // ترتيب المفاتيح لضمان أن الأشهر الأحدث تظهر أولاً
    // ملاحظة: هذا ترتيب بسيط، للأداء العالي يفضل الترتيب أثناء بناء الكائن
    const sortedKeys = Object.keys(groupedTools);
    // (يفترض أن البيانات قادمة مرتبة من الباك إند، لذا سنعتمد على ترتيبها الطبيعي)

    const observerTarget = useRef(null);

    useEffect(() => {
        const currentTarget = observerTarget.current;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    onFetchNextPage?.();
                }
            },
            { threshold: 0.1 }
        );

        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasNextPage, isFetchingNextPage, onFetchNextPage]);

    return (
        <div className="relative space-y-8 pb-10">
            {/* الخط الرأسي للتايم لاين */}
            <div className="absolute top-0 bottom-0 right-4 md:right-8 w-0.5 bg-gradient-to-b from-neon-purple/50 via-blue-500/20 to-transparent hidden md:block" />

            {sortedKeys.map((monthKey) => (
                <div key={monthKey} className="relative z-10">

                    {/* رأس المجموعة (الشهر) */}
                    <div className="sticky top-[70px] z-20 mb-6 flex items-center gap-4">
                        {/* نقطة التايم لاين */}
                        <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-neon-purple shadow-[0_0_10px_rgba(124,58,237,0.5)] shrink-0 translate-x-1/2 right-4 md:right-8 absolute">
                            <div className="w-2.5 h-2.5 bg-neon-purple rounded-full animate-pulse" />
                        </div>

                        {/* عنوان الشهر */}
                        <div className="flex items-center gap-3 bg-card/60 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full shadow-lg mr-0 md:mr-12">
                            <CalendarDays className="w-5 h-5 text-neon-purple" />
                            <h2 className="text-lg font-bold text-foreground capitalize">
                                {monthKey}
                            </h2>
                            <span className="text-xs text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md">
                                {groupedTools[monthKey].length}
                            </span>
                        </div>
                    </div>

                    {/* شبكة أدوات هذا الشهر */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pr-0 md:pr-16 pl-4">
                        {groupedTools[monthKey].map((tool, i) => (
                            <ToolCard key={tool.id} tool={tool} index={i} />
                        ))}
                    </div>
                </div>
            ))}

            {/* زر تحميل المزيد */}
            {/* مؤشر التحميل اللانهائي */}
            <div ref={observerTarget} className="py-12 flex flex-col items-center justify-center gap-3">
                {isFetchingNextPage ? (
                    <>
                        <Loader2 className="w-8 h-8 text-neon-purple animate-spin" />
                        <p className="text-gray-400 text-sm animate-pulse">جاري جلب المزيد من الأدوات الرائعة...</p>
                    </>
                ) : hasNextPage ? (
                    <span className="text-gray-600 text-sm">اسحب للمزيد ↓</span>
                ) : (
                    <div className="text-gray-500 text-sm bg-white/5 px-6 py-2 rounded-full border border-white/5">
                        🎉 لقد وصلت للنهاية! تصفحت {tools?.length || 0} أداة.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolsTimeline;
