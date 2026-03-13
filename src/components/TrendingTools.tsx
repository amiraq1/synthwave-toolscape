import { useEffect, useState } from "react";
import { supabase, isSupabaseNetworkError } from "@/integrations/supabase/client";
import { Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getTrendingToolsFromCatalog } from "@/lib/toolsCatalogFallback";

interface TrendingTool {
  id: string | number;
  title: string;
  views_count: number | null;
}

const TrendingTools = () => {
  const { t, i18n } = useTranslation();
  const [tools, setTools] = useState<TrendingTool[]>([]);

  useEffect(() => {
    let cancelled = false;

    const fetchTrending = async () => {
      try {
        const { data, error } = await supabase
          .from("tools")
          .select("id, title, views_count")
          .eq("is_published", true)
          .order("views_count", { ascending: false })
          .limit(5);

        if (error) {
          throw error;
        }

        if (!cancelled && data) {
          setTools(data as TrendingTool[]);
        }
      } catch (error) {
        if (isSupabaseNetworkError(error)) {
          const fallbackTools = await getTrendingToolsFromCatalog(5);

          if (!cancelled) {
            setTools(
              fallbackTools.map((tool) => ({
                id: tool.id,
                title: tool.title,
                views_count: tool.clicks_count,
              })),
            );
          }

          return;
        }

        console.error("Error fetching trending tools:", error);
      }
    };

    fetchTrending();

    return () => {
      cancelled = true;
    };
  }, []);

  if (tools.length === 0) return null;

  return (
    <div
      className="mb-8 w-full animate-in border-y border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-red-500/10 py-2 fade-in slide-in-from-top-4"
      dir={i18n.dir()}
    >
      <div className="container mx-auto flex items-center gap-4 overflow-hidden px-4">
        <div className="flex items-center gap-2 whitespace-nowrap font-bold text-orange-400">
          <Flame className="h-4 w-4 fill-orange-400 animate-pulse" />
          {t("trending.title")}
        </div>

        <div className="mask-image-linear-to-r flex gap-6 overflow-x-auto whitespace-nowrap no-scrollbar">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              to={`/tool/${tool.id}`}
              className="group flex shrink-0 items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
            >
              <span className="font-bold transition-colors group-hover:text-neon-purple">{tool.title}</span>
              <span className="text-xs text-gray-500">
                ({(tool.views_count || 0).toLocaleString(i18n.language)} {t("trending.views")})
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingTools;
