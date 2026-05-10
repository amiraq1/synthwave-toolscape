import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ToolCard from "@/components/ToolCard";
import { Sparkles } from "lucide-react";
import type { Tool } from "@/types";
import { useTranslation } from "react-i18next";

interface BookmarkWithTool {
    tool_id: number;
    tools: { category: string } | null;
}

const RecommendedForYou = () => {
    const { session } = useAuth();
    const { t } = useTranslation();
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!session) {
                setLoading(false);
                return;
            }

            // 1. جلب مفضلة المستخدم لمعرفة اهتماماته
            const { data: bookmarks } = await supabase
                .from("bookmarks")
                .select(`
          tool_id,
          tools (category)
        `)
                .eq("user_id", session.user.id);

            if (!bookmarks || bookmarks.length === 0) {
                setLoading(false);
                return;
            }

            // 2. استخراج التصنيفات التي يحبها المستخدم
            const typedBookmarks = (bookmarks as unknown as BookmarkWithTool[]);
            const interestedCategories = [...new Set(typedBookmarks.map((b) => b.tools?.category).filter(Boolean))] as string[];
            const bookmarkedIds = typedBookmarks.map((b) => b.tool_id);

            if (interestedCategories.length === 0) {
                setLoading(false);
                return;
            }

            // 3. جلب أدوات مقترحة بناءً على هذه التصنيفات
            const { data: recommendations } = await supabase
                .from("tools")
                .select("*")
                .in("category", interestedCategories)
                .not("id", "in", `(${bookmarkedIds.join(',')})`)
                .eq("is_published", true)
                .limit(4);

            if (recommendations) setTools(recommendations as unknown as Tool[]);
            setLoading(false);
        };

        fetchRecommendations();
    }, [session]);

    if (loading) return null;
    if (!session || tools.length === 0) return null;

    return (
        <section className="editorial-paper p-6 sm:p-7" dir="rtl">
            <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-slate-950 text-white">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="font-editorial text-2xl font-semibold text-slate-950">
                        {t("recommended.title", { defaultValue: "مختار لك خصيصاً" })}
                    </h2>
                    <p className="text-sm text-slate-500">
                        {t("recommended.desc", { defaultValue: "بناءً على الأدوات التي قمت بحفظها في مكتبتك" })}
                    </p>
                </div>
            </div>

            <div className="rounded-[28px] bg-slate-950/98 p-3 sm:p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tools.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecommendedForYou;
