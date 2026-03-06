import { Code, Image as ImageIcon, LayoutGrid, Music, Sparkles, Type, Video, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getValidImageUrl } from "@synthwave/utils";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { cn } from "@/lib/utils";

interface ToolLogoProps {
  title: string;
  imageUrl?: string | null;
  category?: string | null;
  toolUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

const categoryIcons: Record<string, LucideIcon> = {
  "نصوص": Type,
  "صور": ImageIcon,
  "فيديو": Video,
  "برمجة": Code,
  "إنتاجية": Zap,
  "صوت": Music,
  "الكل": LayoutGrid,
};

const sizeMap = {
  sm: {
    container: "w-10 h-10 rounded-lg",
    image: "p-1.5",
    monogram: "text-sm",
    icon: "w-3.5 h-3.5",
    width: 64,
  },
  md: {
    container: "w-12 h-12 rounded-xl",
    image: "p-1.5",
    monogram: "text-lg",
    icon: "w-4 h-4",
    width: 96,
  },
  lg: {
    container: "w-16 h-16 rounded-2xl",
    image: "p-2",
    monogram: "text-2xl",
    icon: "w-4 h-4",
    width: 128,
  },
  xl: {
    container: "w-20 h-20 rounded-2xl",
    image: "p-2.5",
    monogram: "text-3xl",
    icon: "w-5 h-5",
    width: 160,
  },
} as const;

const palettes = [
  {
    surface: "from-sky-500/25 via-cyan-500/10 to-slate-950",
    text: "text-sky-100",
    border: "border-sky-400/20",
    badge: "text-sky-200/70",
  },
  {
    surface: "from-emerald-500/25 via-teal-500/10 to-slate-950",
    text: "text-emerald-100",
    border: "border-emerald-400/20",
    badge: "text-emerald-200/70",
  },
  {
    surface: "from-fuchsia-500/25 via-pink-500/10 to-slate-950",
    text: "text-fuchsia-100",
    border: "border-fuchsia-400/20",
    badge: "text-fuchsia-200/70",
  },
  {
    surface: "from-amber-500/25 via-orange-500/10 to-slate-950",
    text: "text-amber-100",
    border: "border-amber-400/20",
    badge: "text-amber-200/70",
  },
  {
    surface: "from-violet-500/25 via-indigo-500/10 to-slate-950",
    text: "text-violet-100",
    border: "border-violet-400/20",
    badge: "text-violet-200/70",
  },
  {
    surface: "from-rose-500/25 via-red-500/10 to-slate-950",
    text: "text-rose-100",
    border: "border-rose-400/20",
    badge: "text-rose-200/70",
  },
];

const hashValue = (input: string) => {
  let hash = 0;

  for (const character of input) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash;
};

const getMonogram = (title: string) => {
  const cleaned = title.replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    const first = Array.from(parts[0])[0] || "";
    const second = Array.from(parts[1])[0] || "";
    return `${first}${second}`.toUpperCase();
  }

  const graphemes = Array.from(parts[0] || title.trim());
  return graphemes.slice(0, 2).join("").toUpperCase() || "AI";
};

const ToolLogo = ({
  title,
  imageUrl,
  category,
  toolUrl,
  size = "md",
  className,
  imageClassName,
  priority = false,
}: ToolLogoProps) => {
  const sizeConfig = sizeMap[size];
  const CategoryIcon = category ? categoryIcons[category] : null;
  const monogram = getMonogram(title);
  const palette = palettes[hashValue(`${title}:${toolUrl || imageUrl || ""}`) % palettes.length];
  const validImageUrl = getValidImageUrl(imageUrl);

  const fallback = (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br",
        palette.surface,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
      <span
        className={cn(
          "relative z-10 font-black tracking-[0.08em] uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]",
          sizeConfig.monogram,
          palette.text,
        )}
      >
        {monogram}
      </span>

      {CategoryIcon && (
        <div className="absolute bottom-1 right-1 z-10 rounded-full border border-white/10 bg-black/30 p-1 backdrop-blur-sm">
          <CategoryIcon className={cn(sizeConfig.icon, palette.badge)} />
        </div>
      )}
    </div>
  );

  return (
    <ImageWithFallback
      src={validImageUrl}
      alt={title}
      width={sizeConfig.width}
      priority={priority}
      aspectRatio="square"
      containerClassName={cn(
        "shrink-0 border bg-black/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        sizeConfig.container,
        palette.border,
        className,
      )}
      className={cn("h-full w-full object-contain", sizeConfig.image, imageClassName)}
      fallback={fallback}
    />
  );
};

export default ToolLogo;
