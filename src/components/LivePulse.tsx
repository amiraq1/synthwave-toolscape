import { useEffect, useState } from "react";
import { supabase, isSupabaseNetworkError } from "@/integrations/supabase/client";
import { Star, Zap } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";
import { getLatestToolsFromCatalog } from "@/lib/toolsCatalogFallback";

dayjs.extend(relativeTime);
dayjs.locale("ar");

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
}

interface ToolData {
  created_at: string;
  title: string;
}

const LivePulse = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchActivity = async () => {
      try {
        const [reviewsResponse, toolsResponse] = await Promise.all([
          supabase
            .from("reviews")
            .select("created_at, rating, tools(title)")
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("tools")
            .select("created_at, title")
            .order("created_at", { ascending: false })
            .limit(3),
        ]);

        if (reviewsResponse.error) {
          throw reviewsResponse.error;
        }

        if (toolsResponse.error) {
          throw toolsResponse.error;
        }

        const reviews = (reviewsResponse.data ?? []) as ReviewData[];
        const newTools = (toolsResponse.data ?? []) as ToolData[];

        const feed: Activity[] = [
          ...reviews.map((review) => ({
            type: "review" as const,
            text: `تقييم جديد على ${review.tools?.title || "إحدى الأدوات"}`,
            icon: <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />,
            time: review.created_at,
          })),
          ...newTools.map((tool) => ({
            type: "new_tool" as const,
            text: `أداة جديدة: ${tool.title}`,
            icon: <Zap className="w-3 h-3 text-neon-purple fill-neon-purple" />,
            time: tool.created_at,
          })),
        ].sort((left, right) => new Date(right.time).getTime() - new Date(left.time).getTime());

        if (!cancelled) {
          setActivities(feed);
        }
      } catch (error) {
        if (isSupabaseNetworkError(error)) {
          const latestTools = await getLatestToolsFromCatalog(3);

          if (!cancelled) {
            setActivities(
              latestTools.map((tool) => ({
                type: "new_tool",
                text: `أداة جديدة: ${tool.title}`,
                icon: <Zap className="w-3 h-3 text-neon-purple fill-neon-purple" />,
                time: tool.created_at ?? new Date().toISOString(),
              })),
            );
          }

          return;
        }

        console.error("Error fetching live activity:", error);
      }
    };

    fetchActivity();

    return () => {
      cancelled = true;
    };
  }, []);

  if (activities.length === 0) return null;

  return (
    <div className="w-full bg-black/50 border-b border-white/10 backdrop-blur-md overflow-hidden py-2" dir="rtl">
      <div className="container mx-auto flex items-center gap-2">
        <div className="flex items-center gap-1 text-white text-xs font-bold px-3 py-1 bg-neon-purple/30 rounded-full shrink-0">
          <div className="w-2 h-2 rounded-full bg-neon-purple" />
          النبض المباشر
        </div>

        <div className="flex-1 overflow-hidden relative group">
          <div className="flex gap-8 animate-marquee whitespace-nowrap hover:[animation-play-state:paused]">
            {[...activities, ...activities].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs md:text-sm text-slate-200">
                {item.icon}
                <span>{item.text}</span>
                <span className="text-slate-300 text-[10px]">({dayjs(item.time).locale("ar").fromNow()})</span>
                <span className="w-1 h-1 rounded-full bg-slate-500 mx-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePulse;
