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
                // جلب الأدوات بناءً على IDs المحفوظة
                const { data } = await supabase
                    .from('tools')
                    .select('*')
                    .in('id', recentIds.map(Number));

                if (data) {
                    // تحويل البيانات لتتوافق مع نوع Tool وترتيبها
                    const orderedTools = recentIds
                        .map(id => {
                            const found = data.find(t => String(t.id) === id);
                            if (!found) return null;
                            return {
                                ...found,
                                id: String(found.id), // تحويل id لـ string
                                features: found.features || [],
                            } as Tool;
                        })
                        .filter((t): t is Tool => t !== null);
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

    if (!hasRecent) {
        return (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <Clock className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 mb-2">لا توجد أدوات مشاهدة مؤخراً</p>
                <p className="text-sm text-gray-500">عند زيارتك لأي أداة، ستظهر هنا</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">
                    آخر {tools.length} أداة شاهدتها
                </p>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecent}
                    className="text-gray-500 hover:text-red-400 gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    مسح السجل
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                ))}
            </div>
        </div>
    );
};

export default RecentlyViewedTools;
