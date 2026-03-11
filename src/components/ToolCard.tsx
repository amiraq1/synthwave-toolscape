import React, { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Crown,
  ExternalLink,
  Languages,
  Scale,
  Sparkles,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import type { Tool } from "@/hooks/useTools";
import { usePrefetchTool } from "@/hooks/useTool";
import BookmarkButton from "@/components/BookmarkButton";
import ToolLogo from "@/components/ToolLogo";
import { useClickTracking } from "@/hooks/useClickTracking";
import { useCompare } from "@/context/CompareContext";
import { cn } from "@/lib/utils";
import {
  getCategoryLabel,
  getPricingLabel,
  getPricingTier,
  getValidToolUrl,
  type PricingTier,
} from "@synthwave/utils";

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

const pricingTone: Record<PricingTier, string> = {
  free: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  freemium: "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200",
  trial: "border-violet-400/20 bg-violet-400/10 text-violet-200",
  paid: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  unknown: "border-white/10 bg-white/[0.06] text-white/70",
};

const surfaceTone = [
  "before:bg-[radial-gradient(circle_at_20%_16%,rgba(34,211,238,0.16),transparent_28%)]",
  "before:bg-[radial-gradient(circle_at_82%_12%,rgba(236,72,153,0.15),transparent_26%)]",
  "before:bg-[radial-gradient(circle_at_24%_10%,rgba(168,85,247,0.18),transparent_29%)]",
  "before:bg-[radial-gradient(circle_at_78%_18%,rgba(245,158,11,0.17),transparent_28%)]",
] as const;

const SimpleRating = ({
  rating,
  count,
  locale,
}: {
  rating?: number | null;
  count?: number | null;
  locale: string;
}) => {
  const safeRating = typeof rating === "number" && !Number.isNaN(rating) ? rating : 0;
  const safeCount = typeof count === "number" && !Number.isNaN(count) ? count : 0;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span className="tabular-nums">{safeRating.toFixed(1)}</span>
      <span className="text-white/45">({safeCount.toLocaleString(locale)})</span>
    </div>
  );
};

const ToolCard = memo(({ tool, index = 0 }: ToolCardProps) => {
  const prefetchTool = usePrefetchTool();
  const { recordClick } = useClickTracking();
  const { selectedTools, addToCompare, removeFromCompare } = useCompare();
  const { t, i18n } = useTranslation();

  const isCompared = selectedTools.includes(String(tool.id));
  const isSponsored = tool.is_sponsored === true;
  const supportsArabic = tool.supports_arabic === true;
  const toolWebsiteUrl = getValidToolUrl(tool.url);
  const toneClass = surfaceTone[index % surfaceTone.length];
  const pricingTier = getPricingTier(tool.pricing_type);

  const isNew = useMemo(() => {
    if (!tool.created_at) return false;

    const createdAt = new Date(tool.created_at).getTime();
    if (Number.isNaN(createdAt)) return false;

    const daysSinceCreation = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24));
    return daysSinceCreation <= 30;
  }, [tool.created_at]);

  const handleCompareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isCompared) {
      removeFromCompare(String(tool.id));
      return;
    }

    addToCompare(String(tool.id));
  };

  const handleExternalClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation();

    if (!toolWebsiteUrl) {
      event.preventDefault();
      return;
    }

    recordClick(String(tool.id));
  };

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#0a1020] shadow-[0_24px_60px_rgba(0,0,0,0.32)] transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20",
        "before:pointer-events-none before:absolute before:inset-0 before:opacity-100",
        toneClass,
      )}
      onMouseEnter={() => prefetchTool(String(tool.id))}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_28%,rgba(0,0,0,0.08)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:36px_36px] [mask-image:linear-gradient(180deg,#000,transparent_82%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

      <div className="absolute left-4 top-4 z-20">
        <BookmarkButton
          toolId={String(tool.id)}
          className="rounded-2xl border border-white/10 bg-black/40 text-white shadow-[0_12px_24px_rgba(0,0,0,0.28)] backdrop-blur-md hover:bg-black/55"
        />
      </div>

      <div className="absolute right-4 top-4 z-20 flex flex-col gap-2 opacity-100 transition-all duration-300 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
        <button
          type="button"
          onClick={handleCompareClick}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-2xl border backdrop-blur-md transition-colors",
            isCompared
              ? "border-neon-purple/50 bg-neon-purple text-white shadow-[0_10px_30px_rgba(176,38,255,0.32)]"
              : "border-white/10 bg-black/45 text-white/70 hover:border-white/20 hover:bg-black/60 hover:text-white",
          )}
          title={isCompared ? t("tools.remove_compare") : t("tools.add_compare")}
          aria-label={isCompared ? t("tools.remove_compare") : t("tools.add_compare")}
        >
          <Scale className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute right-16 top-4 z-10 flex max-w-[calc(100%-7rem)] flex-wrap gap-2">
        {isSponsored && (
          <Badge className="gap-1 rounded-full border-0 bg-gradient-to-r from-amber-500 to-orange-400 px-2.5 py-1 text-[10px] font-extrabold text-black shadow-[0_8px_18px_rgba(245,158,11,0.28)]">
            <Crown className="h-3 w-3" />
            {t("tools.sponsored")}
          </Badge>
        )}

        {!isSponsored && tool.is_featured && (
          <Badge className="gap-1 rounded-full border border-sky-300/20 bg-sky-300/10 px-2.5 py-1 text-[10px] font-bold text-sky-100">
            <Sparkles className="h-3 w-3" />
            {t("tool.featured")}
          </Badge>
        )}

        {!isSponsored && isNew && (
          <Badge className="gap-1 rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-2.5 py-1 text-[10px] font-bold text-fuchsia-100">
            <Sparkles className="h-3 w-3" />
            {t("tools.new")}
          </Badge>
        )}
      </div>

      <Link
        to={`/tool/${tool.id}`}
        className="relative z-10 flex flex-1 flex-col px-5 pb-5 pt-7 sm:px-6"
        aria-label={t("tools.view_details", { title: tool.title })}
      >
        <div className="flex items-start gap-4 pe-10">
          <div className="relative shrink-0 pt-1">
            <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-[1.35rem] bg-neon-purple/15 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
            <ToolLogo
              title={tool.title}
              imageUrl={tool.image_url}
              category={tool.category}
              toolUrl={tool.url}
              size="lg"
              priority={index < 6}
              className="relative border-white/12 bg-black/45 shadow-[0_20px_36px_rgba(0,0,0,0.34)]"
              imageClassName="p-2.5"
            />
          </div>

          <div className="min-w-0 space-y-3">
            <SimpleRating rating={tool.average_rating} count={tool.reviews_count} locale={i18n.language} />

            <div className="space-y-2">
              <h3 className="line-clamp-2 text-xl font-black leading-tight tracking-tight text-white transition-colors group-hover:text-white/95">
                {tool.title}
              </h3>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/70">
                {getCategoryLabel(tool.category)}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 line-clamp-3 max-w-[92%] text-sm font-medium leading-7 text-white/95 transition-colors group-hover:text-white">
          {tool.description}
        </p>

        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <Badge variant="outline" className="rounded-full border-white/12 bg-white/[0.1] px-3 py-1 text-xs font-semibold text-white">
            {getCategoryLabel(tool.category)}
          </Badge>

          <Badge
            variant="outline"
            className={cn("rounded-full px-3 py-1 text-xs font-semibold", pricingTone[pricingTier])}
          >
            {getPricingLabel(tool.pricing_type)}
          </Badge>

          {supportsArabic && (
            <Badge
              variant="outline"
              className="rounded-full border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-100"
            >
              <Languages className="me-1 h-3.5 w-3.5" />
              {t("tools.arabic")}
            </Badge>
          )}
        </div>
      </Link>

      <div className="relative z-10 border-t border-white/8 px-5 pb-5 pt-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-neon-cyan" />
            {t("tools.ai_powered")}
          </span>

          {toolWebsiteUrl ? (
            <a
              href={toolWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleExternalClick}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.1] px-4 py-2 text-xs font-bold text-white transition-all hover:border-white/25 hover:bg-white/[0.15]"
              aria-label={t("tools.visit_label", { title: tool.title })}
              title={t("tools.visit")}
            >
              {t("tools.visit")}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span
              className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white/52"
              aria-disabled="true"
              title={t("tools.visit_unavailable")}
            >
              {t("tools.visit_unavailable")}
            </span>
          )}
        </div>
      </div>
    </article>
  );
});

ToolCard.displayName = "ToolCard";

export default ToolCard;
