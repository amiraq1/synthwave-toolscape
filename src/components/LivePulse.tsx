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
  profiles: { display_name: string | null } | null;
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
        const [reviewsResponse, newToolsResponse] = await Promise.all([
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

        if (newToolsResponse.error) {
          throw newToolsResponse.error;
        }

        const reviews = (reviewsResponse.data ?? []) as ReviewData[];
        const newTools = (newToolsResponse.data ?? []) as ToolData[];

        const feed: Activity[] = [
          ...reviews.map((review) => ({
            type: "review" as const,
            text: `تقييم جديد على ${review.tools?.title || "أداة"}`,
            icon: <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />,
            time: review.created_at,
          })),
          ...newTools.map((tool) => ({
            type: "new_tool" as const,
            text: `✨ أداة جديدة: ${tool.title}`,
            icon: <Zap className="h-3 w-3 fill-neon-purple text-neon-purple" />,
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
                text: `✨ أداة جديدة: ${tool.title}`,
                icon: <Zap className="h-3 w-3 fill-neon-purple text-neon-purple" />,
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
    <div className="w-full overflow-hidden border-b border-white/5 bg-black/40 py-2 backdrop-blur-md">
      <div className="container mx-auto flex items-center gap-2">
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-neon-purple/10 px-3 py-1 text-xs font-bold text-neon-purple animate-pulse">
          <div className="h-2 w-2 rounded-full bg-neon-purple" />
          نبض مباشر
        </div>

        <div className="group relative flex-1 overflow-hidden">
          <div className="flex animate-marquee gap-8 whitespace-nowrap hover:[animation-play-state:paused]">
            {[...activities, ...activities].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-gray-300 md:text-sm">
                {item.icon}
                <span>{item.text}</span>
                <span className="text-[10px] text-gray-500">
                  ({dayjs(item.time).locale("ar").fromNow()})
                </span>
                <span className="ml-4 h-1 w-1 rounded-full bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePulse;
