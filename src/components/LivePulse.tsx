import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

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
    profiles: { full_name: string | null } | null;
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
                .select("created_at, rating, tools(title), profiles(full_name)")
                .order("created_at", { ascending: false })
                .limit(3);

            // 2. جلب آخر الأدوات المضافة
            const { data: newTools } = await supabase
                .from("tools")
                .select("created_at, title")
                .eq("is_published", true)
                .order("created_at", { ascending: false })
                .limit(3);

            // 3. دمج البيانات وتنسيقها
            const feed: Activity[] = [
                ...((reviews as unknown as ReviewData[]) || []).map((r) => ({
                    type: "review" as const,
                    text: `قام ${r.profiles?.full_name || "مستخدم"} بتقييم ${r.tools?.title || "أداة"}`,
                    icon: <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />,
                    time: r.created_at,
                })),
                ...((newTools as unknown as ToolData[]) || []).map((t) => ({
                    type: "new_tool" as const,
                    text: `✨ أداة جديدة: ${t.title}`,
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
        <div className="w-full bg-black/40 border-b border-white/5 backdrop-blur-md overflow-hidden py-2">
            <div className="container mx-auto flex items-center gap-2">
                <div className="flex items-center gap-1 text-neon-purple text-xs font-bold px-3 py-1 bg-neon-purple/10 rounded-full shrink-0 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-neon-purple" />
                    نبض مباشر
                </div>

                {/* شريط متحرك (Marquee) */}
                <div className="flex-1 overflow-hidden relative group">
                    <div className="flex gap-8 animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
                        {[...activities, ...activities].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs md:text-sm text-gray-300">
                                {item.icon}
                                <span>{item.text}</span>
                                <span className="text-gray-500 text-[10px]">
                                    ({formatDistanceToNow(new Date(item.time), { addSuffix: true, locale: ar })})
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-700 ml-4" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivePulse;
