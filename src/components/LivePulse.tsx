import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Zap } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/en';

dayjs.extend(relativeTime);
dayjs.locale('en');

interface Activity {
    type: "review" | "new_tool";
    text: string;
    icon: React.ReactNode;
    time: string;
}

interface ReviewData {
    created_at: string;
    rating: number;
    tools: { title: string } | null;
    profiles: { display_name: string | null } | null;
}

interface ToolData {
    created_at: string;
    title: string;
}

const LivePulse = () => {
    const [activities, setActivities] = useState<Activity[]>([]);

    useEffect(() => {
        const fetchActivity = async () => {
            // 1. جلب آخر المراجعات
            const { data: reviews } = await supabase
                .from("reviews")
                .select("created_at, rating, tools(title)")
                .order("created_at", { ascending: false })
                .limit(3) as { data: ReviewData[] | null };

            // 2. جلب آخر الأدوات المضافة
            const { data: newTools } = await supabase
                .from("tools")
                .select("created_at, title")
                .order("created_at", { ascending: false })
                .limit(3) as { data: ToolData[] | null };

            // 3. دمج البيانات وتنسيقها
            const feed: Activity[] = [
                ...(reviews || []).map((r) => ({
                    type: "review" as const,
                    text: `New rating on ${r.tools?.title || "a tool"}`,
                    icon: <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />,
                    time: r.created_at,
                })),
                ...(newTools || []).map((t) => ({
                    type: "new_tool" as const,
                    text: `✨ New tool: ${t.title}`,
                    icon: <Zap className="w-3 h-3 text-neon-purple fill-neon-purple" />,
                    time: t.created_at,
                })),
            ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

            setActivities(feed);
        };

        fetchActivity();
    }, []);

    if (activities.length === 0) return null;

    return (
        <div className="w-full bg-black/50 border-b border-white/10 backdrop-blur-md overflow-hidden py-2">
            <div className="container mx-auto flex items-center gap-2">
                <div className="flex items-center gap-1 text-white text-xs font-bold px-3 py-1 bg-neon-purple/30 rounded-full shrink-0">
                    <div className="w-2 h-2 rounded-full bg-neon-purple" />
                    Live Pulse
                </div>

                {/* شريط متحرك (Marquee) */}
                <div className="flex-1 overflow-hidden relative group">
                    <div className="flex gap-8 animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
                        {[...activities, ...activities].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs md:text-sm text-slate-200">
                                {item.icon}
                                <span>{item.text}</span>
                                <span className="text-slate-300 text-[10px]">
                                    ({dayjs(item.time).locale('en').fromNow()})
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-500 ml-4" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivePulse;
