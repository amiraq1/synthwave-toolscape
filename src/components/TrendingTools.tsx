import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Flame, MousePointerClick, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface TrendingTool {
    id: number;
    title: string;
    clicks_count: number;
    trending_score: number;
}

const TrendingTools = () => {
    const { i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    // جلب البيانات عبر react-query لأداء أعلى مع Caching
    const { data: tools = [], isLoading } = useQuery({
        queryKey: ["trending_tools_ticker"],
        queryFn: async () => {
            const { data, error } = await (supabase
                .from("tools")
                .select("id, title, clicks_count, trending_score, created_at") as any)
                .eq("is_published", true)
                .order("trending_score", { ascending: false, nullsFirst: false })
                .order("clicks_count", { ascending: false, nullsFirst: false })
                .limit(10);

            if (error) {
                console.error("Error fetching trending tools:", error);
                throw error;
            }
            return data.map((tool: any) => ({
                id: tool.id,
                title: tool.title,
                clicks_count: tool.clicks_count ?? 0,
                trending_score: tool.trending_score ?? 0
            })) as TrendingTool[];
        },
        staleTime: 1000 * 60 * 10, // 10 minutes cache
    });

    if (isLoading || tools.length === 0) return null;

    // duplicate tools to create a seamless infinite marquee effect
    const marqueeItems = [...tools, ...tools, ...tools];

    return (
        <div
            className="w-full bg-[#0f0f1a]/80 border-y border-white/5 backdrop-blur-2xl py-2 relative overflow-hidden z-30 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex items-center"
            role="marquee"
            aria-label={isAr ? "الأدوات الأكثر شهرة واستخدام" : "Most popular and trending tools"}
        >
            {/* Ambient Lighting Layer */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 opacity-50 pointer-events-none mix-blend-screen" />

            <div className="w-full flex items-center gap-4 relative">

                {/* Fixed Label: Hot & Trending */}
                <div className={cn(
                    "relative flex items-center gap-2 text-orange-400 font-bold whitespace-nowrap z-40 bg-[#0f0f1a] shadow-[0_0_20px_20px_rgba(15,15,26,1)] px-4 sm:px-6 py-1",
                    isAr ? "flex-row-reverse rounded-r-full ml-auto" : "rounded-l-full mr-auto"
                )}>
                    <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                        <Flame className="w-5 h-5 fill-orange-500 animate-fire drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                        <div className="absolute inset-0 bg-orange-600 blur-xl opacity-40 animate-pulse" />
                    </div>
                    <span className="hidden sm:inline-block text-sm sm:text-base tracking-wide font-bold uppercase bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                        {isAr ? "الأكثر شهرة واستخدام" : "Trending Now"}
                    </span>
                    {/* Visual Separator */}
                    <div className="h-5 w-[1px] bg-white/10 mx-2 hidden sm:block" />
                </div>

                {/* Marquee Container (GPU Accelerated) */}
                <div
                    className="flex-1 overflow-hidden relative mask-fade-sides"
                // Pause animation when interacting (accessibility & UX)
                >
                    <div
                        className={cn(
                            "flex w-max items-center gap-8 sm:gap-12 group hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] transform-gpu",
                            isAr ? "animate-marquee-slow-rtl" : "animate-marquee-slow"
                        )}
                        style={{ width: 'max-content' }}
                    >
                        {marqueeItems.map((tool, index) => (
                            <Link
                                key={`${tool.id}-${index}`}
                                to={`/tool/${tool.id}`}
                                className="flex items-center gap-2 sm:gap-3 transition-all duration-300 hover:-translate-y-0.5"
                                aria-label={`${tool.title} - ${tool.clicks_count} views`}
                            >
                                <div className="flex items-center gap-2 group/item">
                                    <Activity className="w-3.5 h-3.5 text-orange-500/50 group-hover/item:text-orange-400 transition-colors" />
                                    <span className="text-sm font-semibold text-slate-300 group-hover/item:text-white group-hover/item:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all">
                                        {tool.title}
                                    </span>
                                </div>

                                {/* Metric Pill */}
                                <div className="flex items-center gap-1 text-[10px] font-mono text-orange-200/70 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full shadow-[inset_0_0_8px_rgba(249,115,22,0.1)]">
                                    <MousePointerClick className="w-2.5 h-2.5" />
                                    <span>{tool.clicks_count > 1000 ? `${(tool.clicks_count / 1000).toFixed(1)}k` : tool.clicks_count}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Aesthetic Edges Masking */}
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#0f0f1a] to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#0f0f1a] to-transparent pointer-events-none z-10" />
        </div>
    );
};

export default TrendingTools;
