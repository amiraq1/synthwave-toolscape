import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  CircleDot,
  Cpu,
  Database,
  Globe2,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { useToolsStats } from "@/hooks/useToolsCount";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching?: boolean;
}

const quickFilters = ["البرمجة", "التصميم", "الفيديو", "التسويق", "الصوت"];

const HeroSection = ({ searchQuery, onSearchChange, isSearching: _isSearching }: HeroSectionProps) => {
  const shouldReduceMotion = useReducedMotion();
  const { data: stats } = useToolsStats();

  const formatCount = (n: number | undefined) => {
    if (!n) return "0";
    return new Intl.NumberFormat("ar", { notation: "compact" }).format(n);
  };

  const statCards = useMemo(
    () => [
      {
        icon: Database,
        label: "أداة منشورة",
        value: formatCount(stats?.total_tools),
        accent: "text-neon-purple",
      },
      {
        icon: Globe2,
        label: "تغطية عربية",
        value: "AR",
        accent: "text-neon-cyan",
      },
      {
        icon: Sparkles,
        label: "أدوات مجانية",
        value: formatCount(stats?.free_tools),
        accent: "text-amber-400",
      },
      {
        icon: Zap,
        label: "سرعة الاكتشاف",
        value: "فائق",
        accent: "text-rose-400",
      },
    ],
    [stats],
  );

  const parentMotion = shouldReduceMotion
    ? {}
    : {
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    };

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#090914] px-5 pb-10 pt-14 sm:px-8 sm:pt-16 lg:px-10"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_18%,rgba(37,99,235,0.26),transparent_36%),radial-gradient(circle_at_12%_88%,rgba(168,85,247,0.24),transparent_38%),linear-gradient(160deg,#05050a_0%,#0b0b17_45%,#090912_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.15] [background-image:linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:44px_44px]"
        style={{
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.75), transparent 80%)",
          WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.75), transparent 80%)",
        }}
      />

      <div className="relative grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div {...parentMotion} className="space-y-8">
          <Badge className="w-fit gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-300 hover:bg-emerald-400/15">
            <CircleDot className="h-3.5 w-3.5 animate-pulse" />
            محرك البحث نشط
          </Badge>

          <div className="space-y-5">
            <h1 id="hero-title" className="text-balance text-4xl font-display font-black leading-tight text-white sm:text-6xl lg:text-7xl">
              اكتشف أدوات الذكاء الاصطناعي
              <span className="mt-2 block bg-gradient-to-r from-violet-200 via-neon-purple to-neon-cyan bg-clip-text text-transparent">
                الأسرع لعملك اليومي
              </span>
            </h1>
            <p className="max-w-2xl text-pretty text-base leading-relaxed text-slate-300 sm:text-lg">
              تجربة بحث دقيقة، تصنيف ذكي، وواجهة مصممة لتقليل وقت القرار من أول نظرة.
            </p>
          </div>

          <div className="relative rounded-3xl border border-white/10 bg-black/35 p-2 backdrop-blur-xl shadow-[0_20px_60px_rgba(4,4,12,0.55)]">
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/5 [background:linear-gradient(130deg,rgba(168,85,247,0.12),transparent_30%,rgba(6,182,212,0.08)_100%)]" />
            <div className="relative flex flex-col gap-2 sm:flex-row sm:items-center">
              <SearchAutocomplete
                value={searchQuery}
                onChange={onSearchChange}
                onSearch={onSearchChange}
                className="w-full"
                inputClassName="h-14 rounded-2xl border-white/10 bg-white/5 px-4 text-base font-semibold"
                placeholder="ابحث عن أداة، فئة، أو مهمة..."
              />
              <Button
                type="button"
                onClick={() => onSearchChange(searchQuery.trim())}
                className="h-14 rounded-2xl bg-neon-purple px-6 text-base font-bold text-white hover:bg-neon-purple/90 sm:min-w-[132px]"
              >
                بحث
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2" aria-label="اقتراحات سريعة">
            {quickFilters.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSearchChange(tag)}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:border-neon-cyan/40 hover:text-neon-cyan"
              >
                #{tag}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.aside
          {...(shouldReduceMotion
            ? {}
            : {
              initial: { opacity: 0, x: 18 },
              animate: { opacity: 1, x: 0 },
              transition: { delay: 0.12, duration: 0.46, ease: [0.22, 1, 0.36, 1] },
            })}
          className="space-y-4"
          aria-label="إحصاءات المنصة"
        >
          <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-slate-400">
              <Cpu className="h-4 w-4 text-neon-cyan" />
              نبض البحث المباشر
            </p>
            <h2 className="text-2xl font-extrabold text-white">مصمم للسرعة والوضوح</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              كل عنصر هنا يخدم قرارًا واحدًا: الوصول لأفضل أداة في أقل عدد نقرات.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {statCards.map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  "rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.28)]",
                  index === 1 ? "translate-y-3" : "",
                )}
              >
                <item.icon className={cn("mb-3 h-5 w-5", item.accent)} />
                <p className="text-2xl font-black text-white">{item.value}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.aside>
      </div>
    </section>
  );
};

export default HeroSection;
