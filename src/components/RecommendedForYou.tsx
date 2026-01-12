import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ToolCard from "@/components/ToolCard";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Tool } from "@/types";

interface BookmarkWithTool {
    tool_id: number;
    tools: { category: string } | null;
}

const RecommendedForYou = () => {
    const { session } = useAuth();
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const { i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

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

            if (recommendations) setTools(recommendations);
            setLoading(false);
        };

        fetchRecommendations();
    }, [session]);

    if (loading) return null;
    if (!session || tools.length === 0) return null;

    return (
        <div className="container mx-auto px-4 mb-12 animate-fade-in" dir={isAr ? "rtl" : "ltr"}>
            <div className="bg-gradient-to-r from-neon-purple/10 to-blue-500/10 border border-neon-purple/20 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-neon-purple/20 p-2 rounded-full">
                        <Sparkles className="w-6 h-6 text-neon-purple fill-neon-purple" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            {isAr ? "مختار لك خصيصاً" : "Recommended for You"}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {isAr
                                ? "بناءً على الأدوات التي قمت بحفظها في مكتبتك"
                                : "Based on the tools you've saved to your library"
                            }
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tools.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecommendedForYou;
