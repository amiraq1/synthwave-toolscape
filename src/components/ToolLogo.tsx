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
    surface: "from-sky-400/40 via-cyan-600/25 to-slate-900",
    text: "text-white",
    border: "border-sky-400/30",
    badge: "text-sky-200/80",
  },
  {
    surface: "from-emerald-400/40 via-teal-600/25 to-slate-900",
    text: "text-white",
    border: "border-emerald-400/30",
    badge: "text-emerald-200/80",
  },
  {
    surface: "from-fuchsia-400/40 via-purple-600/25 to-slate-900",
    text: "text-white",
    border: "border-fuchsia-400/30",
    badge: "text-fuchsia-200/80",
  },
  {
    surface: "from-amber-400/40 via-orange-600/25 to-slate-900",
    text: "text-white",
    border: "border-amber-400/30",
    badge: "text-amber-200/80",
  },
  {
    surface: "from-violet-400/40 via-indigo-600/25 to-slate-900",
    text: "text-white",
    border: "border-violet-400/30",
    badge: "text-violet-200/80",
  },
  {
    surface: "from-rose-400/40 via-pink-600/25 to-slate-900",
    text: "text-white",
    border: "border-rose-400/30",
    badge: "text-rose-200/80",
  },
  {
    surface: "from-lime-400/40 via-green-600/25 to-slate-900",
    text: "text-white",
    border: "border-lime-400/30",
    badge: "text-lime-200/80",
  },
  {
    surface: "from-orange-400/40 via-red-600/25 to-slate-900",
    text: "text-white",
    border: "border-orange-400/30",
    badge: "text-orange-200/80",
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
