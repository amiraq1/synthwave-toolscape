import { Link } from "react-router-dom";
import { Sparkles, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Tool } from "@/hooks/useTools";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface AIMosaicShowcaseProps {
  tools: Tool[];
}

const tilePattern = [
  "md:col-span-3 md:row-span-3",
  "md:col-span-3 md:row-span-2",
  "md:col-span-3 md:row-span-2",
  "md:col-span-3 md:row-span-2",
  "md:col-span-3 md:row-span-2",
  "md:col-span-3 md:row-span-2",
  "md:col-span-3 md:row-span-3",
  "md:col-span-3 md:row-span-2",
] as const;

const fallbackImages = [
  "/robot-placeholder.webp",
  "/pwa-512x512.webp",
  "/pwa-192x192.webp",
] as const;



const AIMosaicShowcase = ({ tools }: AIMosaicShowcaseProps) => {
  const { t } = useTranslation();
  if (!tools.length) return null;

  const trimDescription = (description?: string | null) => {
    if (!description) return t('showcase.fallback_desc');
    return description.length > 76 ? `${description.slice(0, 76).trim()}...` : description;
  };

  return (
    <section
      dir="ltr"
      aria-label="عرض أدوات الذكاء الاصطناعي المميزة"
      className="relative overflow-hidden rounded-[28px] border border-white/20 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 px-4 py-4 shadow-[0_35px_90px_rgba(0,0,0,0.38)] sm:px-5 sm:py-5"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(14,165,233,0.2),transparent_32%),radial-gradient(circle_at_84%_6%,rgba(168,85,247,0.18),transparent_34%)]"
      />

      <div className="relative mb-4 flex items-center justify-between px-0.5">
        <h2 className="font-display text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          {t('showcase.heading')}
        </h2>
        <span className="rounded-full border border-slate-300 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-500 shadow-sm">
          {t('showcase.brand')}
        </span>
      </div>

      <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2 md:auto-rows-[76px] md:grid-cols-12">
        {tools.slice(0, 8).map((tool, index) => {
          const tileClass = tilePattern[index % tilePattern.length];
          const imageUrl = tool.image_url || fallbackImages[index % fallbackImages.length];

          return (
            <Link
              key={`${tool.id}-${index}`}
              to={`/tool/${tool.id}`}
              className={cn(
                "group relative isolate overflow-hidden rounded-2xl border border-slate-300/80 bg-slate-900 p-3 text-white shadow-[0_12px_26px_rgba(2,6,23,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(2,6,23,0.35)]",
                "min-h-[190px] sm:min-h-[170px] md:min-h-0",
                tileClass,
              )}
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(3,7,18,0.05) 28%, rgba(3,7,18,0.74) 70%, rgba(2,6,23,0.96) 100%), url("${imageUrl}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute left-2.5 top-2.5">
                <Badge className="gap-1 border-0 bg-slate-900/70 text-[10px] text-slate-100 backdrop-blur-md">
                  <Bot className="h-3 w-3" />
                  {tool.category || "AI"}
                </Badge>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

              <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
                <h3 className="line-clamp-1 font-display text-lg font-semibold leading-tight tracking-tight text-white">
                  {tool.title}
                </h3>
                <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-200/85">
                  {trimDescription(tool.description)}
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-900 shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  {t('showcase.view_details')}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default AIMosaicShowcase;
