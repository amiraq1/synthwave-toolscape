import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Flame, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface TrendingTool {
    id: number;
    title: string;
    clicks_count: number;
}

const TrendingTools = () => {
    const [tools, setTools] = useState<TrendingTool[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                // Query directly to avoid RPC overload ambiguity (PGRST203).
                const { data, error } = await supabase
                    .from("tools")
                    .select("id, title, clicks_count, created_at")
                    .eq("is_published", true)
                    .order("clicks_count", { ascending: false, nullsFirst: false })
                    .order("created_at", { ascending: false })
                    .limit(10);

                if (error) throw error;
                if (data) {
                    setTools(data.map((tool) => ({
                        id: tool.id,
                        title: tool.title,
                        clicks_count: tool.clicks_count ?? 0,
                    })));
                }
            } catch (error) {
                console.error("Error fetching trending tools:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, []);

    if (loading || tools.length === 0) return null;

    return (
        <div className="w-full bg-[#0f0f1a] border-y border-white/5 backdrop-blur-xl py-2 relative overflow-hidden z-30">

            {/* Background Micro-effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5 opacity-50 pointer-events-none" />

            <div className="container mx-auto px-4 flex items-center gap-4">

                {/* Label: Hot & Trending */}
                <div className="flex items-center gap-2 text-orange-400 font-bold whitespace-nowrap z-20 pl-4 py-1 rounded-l-full">
                    <div className="relative flex items-center justify-center w-6 h-6">
                        <Flame className="w-4 h-4 fill-orange-500 animate-fire" />
                        <div className="absolute inset-0 bg-orange-500 blur-md opacity-40 animate-pulse" />
                    </div>
                    <span className="hidden sm:inline-block text-sm tracking-wide font-mono uppercase">Trending Now</span>
                    <div className="h-4 w-[1px] bg-white/10 mx-2 hidden sm:block" />
                </div>

                {/* Marquee Container */}
                <div className="flex-1 overflow-hidden relative mask-fade-sides">
                    <div className="flex w-max animate-marquee-slow gap-12 group hover:[animation-play-state:paused] items-center">
                        {[...tools, ...tools, ...tools].map((tool, index) => (
                            <Link
                                key={`${tool.id}-${index}`}
                                to={`/tool/${tool.id}`}
                                className="flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                            >
                                <div className="flex items-center gap-1.5">
                                    <Zap className="w-3 h-3 text-orange-500/70" />
                                    <span className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                                        {tool.title}
                                    </span>
                                </div>

                                <span className="text-[10px] font-mono text-slate-500 bg-white/[0.03] border border-white/5 px-1.5 rounded-sm">
                                    {tool.clicks_count > 1000 ? `${(tool.clicks_count / 1000).toFixed(1)}k` : tool.clicks_count}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Aesthetic Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0f0f1a] to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0f0f1a] to-transparent pointer-events-none z-10" />
        </div>
    );
};

export default TrendingTools;
