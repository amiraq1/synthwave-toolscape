import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface TrendingTool {
    id: string | number;
    title: string;
    views_count: number | null;
}

const TrendingTools = () => {
    const { t, i18n } = useTranslation();
    const [tools, setTools] = useState<TrendingTool[]>([]);

    useEffect(() => {
        const fetchTrending = async () => {
            const { data } = await (supabase.from("tools") as any)
                .select("id, title, views_count")
                .eq("is_published", true)
                .order("views_count", { ascending: false })
                .limit(5);

            if (data) setTools(data as TrendingTool[]);
        };

        fetchTrending();
    }, []);

    if (tools.length === 0) return null;

    return (
        <div className="w-full bg-gradient-to-r from-orange-500/10 to-red-500/10 border-y border-orange-500/20 py-2 mb-8 animate-in fade-in slide-in-from-top-4" dir={i18n.dir()}>
            <div className="container mx-auto px-4 flex items-center gap-4 overflow-hidden">
                <div className="flex items-center gap-2 text-orange-400 font-bold whitespace-nowrap">
                    <Flame className="w-4 h-4 fill-orange-400 animate-pulse" />
                    {t('trending.title')}
                </div>

                <div className="flex gap-6 overflow-x-auto no-scrollbar whitespace-nowrap mask-image-linear-to-r">
                    {tools.map((tool) => (
                        <Link
                            key={tool.id}
                            to={`/tool/${tool.id}`}
                            className="text-sm text-gray-300 hover:text-white flex items-center gap-2 transition-colors flex-shrink-0 group"
                        >
                            <span className="font-bold group-hover:text-neon-purple transition-colors">{tool.title}</span>
                            <span className="text-xs text-gray-500">({(tool.views_count || 0).toLocaleString(i18n.language)} {t('trending.views')})</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrendingTools;
