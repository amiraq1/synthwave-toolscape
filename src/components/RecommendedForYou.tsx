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

const PLACEHOLDER_TITLE_REGEX = /^toolscape ai(?:\s+\d+)?$/i;
const INTERNAL_TOOLSCAPE_URL_REGEX = /^https?:\/\/(?:www\.)?toolscape\.ai\/tool\/\d+\/?$/i;
const MAX_RECOMMENDATIONS = 4;
const PRIMARY_FETCH_LIMIT = 48;
const FALLBACK_FETCH_LIMIT = 96;

const isRecommendationCandidate = (tool: Tool): boolean => {
    const title = (tool.title || "").trim();
    const url = (tool.url || "").trim();

    if (!title || !url) return false;
    if (PLACEHOLDER_TITLE_REGEX.test(title)) return false;
    if (INTERNAL_TOOLSCAPE_URL_REGEX.test(url)) return false;

    return true;
};

const dedupeTools = (items: Tool[]): Tool[] => {
    const map = new Map<string, Tool>();

    for (const item of items) {
        const key = `${String(item.id)}::${item.url || ""}`;
        if (!map.has(key)) {
            map.set(key, item);
        }
    }

    return Array.from(map.values());
};

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
                .order("clicks_count", { ascending: false, nullsFirst: false })
                .order("created_at", { ascending: false })
                .limit(PRIMARY_FETCH_LIMIT);

            const primaryCandidates = dedupeTools(
                (recommendations || []).filter(isRecommendationCandidate)
            );

            let finalRecommendations = primaryCandidates.slice(0, MAX_RECOMMENDATIONS);

            // If category-based results are weak/noisy, fill from global top published tools.
            if (finalRecommendations.length < MAX_RECOMMENDATIONS) {
                const excludedIds = [
                    ...new Set(
                        [
                            ...bookmarkedIds,
                            ...finalRecommendations
                                .map((tool) => Number(tool.id))
                                .filter((value) => Number.isFinite(value)),
                        ]
                    ),
                ];

                let fallbackQuery = supabase
                    .from("tools")
                    .select("*")
                    .eq("is_published", true)
                    .order("clicks_count", { ascending: false, nullsFirst: false })
                    .order("created_at", { ascending: false })
                    .limit(FALLBACK_FETCH_LIMIT);

                if (excludedIds.length > 0) {
                    fallbackQuery = fallbackQuery.not("id", "in", `(${excludedIds.join(",")})`);
                }

                const { data: fallbackTools } = await fallbackQuery;

                const merged = dedupeTools([
                    ...finalRecommendations,
                    ...(fallbackTools || []).filter(isRecommendationCandidate),
                ]);

                finalRecommendations = merged.slice(0, MAX_RECOMMENDATIONS);
            }

            if (finalRecommendations.length > 0) {
                setTools(finalRecommendations);
            }
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
