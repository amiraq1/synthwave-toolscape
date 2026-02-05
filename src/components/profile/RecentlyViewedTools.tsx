import { useEffect, useState } from "react";
import { Clock, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import ToolCard from "@/components/ToolCard";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import type { Tool } from "@/types"; // يفضل استخدام النوع المركزي
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const RecentlyViewedTools = () => {
    const { recentIds, clearRecent, hasRecent } = useRecentlyViewed();
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTools = async () => {
            if (!hasRecent || recentIds.length === 0) {
                setLoading(false);
                setTools([]); // تصفير الحالة
                return;
            }

            try {
                // جلب الأدوات
                const { data, error } = await supabase
                    .from('tools')
                    .select('*')
                    .in('id', recentIds.map(Number)); // تحويل النصوص لأرقام لـ Supabase

                if (error) throw error;

                if (data) {
                    // 🚀 تحسين الأداء: إنشاء Map للوصول السريع للأدوات
                    // المفتاح هو الـ ID، والقيمة هي الأداة
                    const toolsMap = new Map(data.map(t => [t.id, t]));

                    // إعادة بناء القائمة بناءً على ترتيب recentIds (من الأحدث للأقدم)
                    const orderedTools = recentIds
                        .map(id => toolsMap.get(Number(id))) // جلب الأداة من الـ Map
                        .filter((item): item is typeof data[0] => item !== undefined) // استبعاد العناصر المحذوفة
                        .map(item => ({
                            ...item,
                            id: String(item.id), // توحيد نوع الـ ID
                            features: Array.isArray(item.features) ? item.features : [], // التأكد من المصفوفة
                        } as Tool));

                    setTools(orderedTools);
                }
            } catch (error) {
                console.error('Error fetching recent tools:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTools();
    }, [recentIds, hasRecent]);

    if (!hasRecent && !loading && tools.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Clock className="w-5 h-5 text-neon-purple" />
                    <span>شوهدت مؤخراً</span>
                </h3>
                {tools.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecent}
                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 gap-2 text-xs"
                    >
                        <Trash2 className="w-3 h-3" /> مسح السجل
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="flex gap-4 p-4 rounded-xl bg-white/5 animate-pulse">
                            <Skeleton className="w-16 h-16 rounded-lg bg-white/10" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4 bg-white/10" />
                                <Skeleton className="h-3 w-1/2 bg-white/10" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : tools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tools.slice(0, 6).map((tool) => (
                        <ToolCard key={tool.id} tool={tool} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-white/5 rounded-xl border border-white/5 border-dashed">
                    <p className="text-gray-400 text-sm">لم تقم باستعراض أي أدوات مؤخراً.</p>
                    <Button variant="link" asChild className="text-neon-purple mt-2">
                        <Link to="/" className="gap-2">
                            تصفح الأدوات <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default RecentlyViewedTools;
