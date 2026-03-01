import { lazy, Suspense, useMemo, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useIdleLoad } from "@/hooks/useIdleLoad";
import HeroSection from "@/components/HeroSection";
import CategoryFilters from "@/components/CategoryFilters";
import ToolsGrid from "@/components/ToolsGrid";
import PersonaFilter, { PERSONAS, type PersonaId } from "@/components/PersonaFilter";
import { useTools, categories, type Category } from "@/hooks/useTools";
import { useSEO } from "@/hooks/useSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import { X, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSearchParams } from "react-router-dom";
import { ToolsSorter, type SortOption } from "@/components/ToolsSorter";

const LivePulse = lazy(() => import("@/components/LivePulse"));
const TrendingTools = lazy(() => import("@/components/TrendingTools"));
const RecommendedForYou = lazy(() => import("@/components/RecommendedForYou"));
const ToolsTimeline = lazy(() => import("@/components/ToolsTimeline"));

const defaultCategory = categories[0] as Category;

const reveal = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const deferredSectionStyle: CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: "1px 760px",
};

const Index = () => {
  useSEO({
    title: "الرئيسية",
    description: "دليل عربي ذكي لاكتشاف ومقارنة أدوات الذكاء الاصطناعي بسرعة ودقة.",
    ogType: "website",
  });

  const shouldReduceMotion = useReducedMotion();
  const [searchParams] = useSearchParams();
  const initialSort = (searchParams.get("sort") as SortOption) || "trending";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>(defaultCategory);
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>("all");
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const showEnhancements = useIdleLoad(9000);

  const clearFilters = () => {
    setSelectedPersona("all");
    setActiveCategory(defaultCategory);
    setSearchQuery("");
  };

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTools({
    searchQuery,
    selectedPersona,
    category: activeCategory,
    sortBy,
  });

  const tools = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

  const personaCounts = useMemo(() => {
    if (tools.length === 0) return {};
    const counts: Record<string, number> = { all: tools.length };

    PERSONAS.forEach((persona) => {
      if (persona.id === "all") return;
      counts[persona.id] = tools.filter((tool) =>
        persona.categories.some((cat) => tool.category?.toLowerCase().includes(cat.toLowerCase())),
      ).length;
    });

    return counts;
  }, [tools]);

  const structuredDataItems = useMemo(
    () => tools.map((tool) => ({ id: tool.id, name: tool.title, url: tool.url })),
    [tools],
  );

  useStructuredData({
    type: "itemList",
    name: "دليل أدوات الذكاء الاصطناعي",
    description: "قائمة بأفضل أدوات الذكاء الاصطناعي المخصصة للمستخدم العربي.",
    items: structuredDataItems,
  });

  const hasFilters = selectedPersona !== "all" || activeCategory !== defaultCategory || Boolean(searchQuery);
  const isDefaultView = !searchQuery && activeCategory === defaultCategory && selectedPersona === "all";

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-[#060610] font-cairo text-right text-white selection:bg-neon-purple selection:text-white"
      dir="rtl"
    >
      <div className="pointer-events-none fixed -right-[14rem] top-[-12rem] h-[32rem] w-[32rem] rounded-full bg-neon-purple/10 blur-[140px]" />
      <div className="pointer-events-none fixed -left-[10rem] bottom-[-8rem] h-[26rem] w-[26rem] rounded-full bg-neon-cyan/10 blur-[130px]" />

      {showEnhancements && (
        <Suspense fallback={null}>
          <LivePulse />
        </Suspense>
      )}

      <main
        id="main-content"
        role="main"
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
      >
        <motion.section
          aria-label="البحث والاستكشاف"
          initial={shouldReduceMotion ? false : "hidden"}
          animate={shouldReduceMotion ? undefined : "visible"}
          variants={reveal}
        >
          <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} isSearching={isLoading} />
        </motion.section>

        {showEnhancements && (
          <section style={deferredSectionStyle}>
            <Suspense
              fallback={<div className="h-10 w-full rounded-xl border border-white/5 bg-white/[0.02]" aria-hidden="true" />}
            >
              <TrendingTools />
            </Suspense>
          </section>
        )}

        <motion.section
          className="sticky top-4 z-40"
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView={shouldReduceMotion ? undefined : "visible"}
          viewport={{ once: true, margin: "-80px" }}
          variants={reveal}
        >
          <div className="relative rounded-2xl border border-white/10 bg-black/35 p-2 backdrop-blur-xl shadow-[0_16px_36px_rgba(0,0,0,0.35)]">
            <PersonaFilter
              currentPersona={selectedPersona}
              onSelect={(id) => setSelectedPersona(id as PersonaId)}
              counts={personaCounts}
            />

            {hasFilters && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-red-400/40 hover:text-red-300"
                >
                  <X className="h-3 w-3" />
                  مسح جميع الفلاتر
                </button>
              </div>
            )}
          </div>
        </motion.section>

        <motion.section
          className="space-y-5"
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView={shouldReduceMotion ? undefined : "visible"}
          viewport={{ once: true, margin: "-100px" }}
          variants={reveal}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-2xl font-black text-white">
              <span className="h-6 w-1.5 rounded-full bg-neon-purple" />
              الأدوات المتاحة
            </h2>

            <div className="flex items-center gap-2" aria-live="polite">
              {searchQuery ? (
                <Badge variant="secondary" className="gap-2 bg-white/10 text-slate-300">
                  <Search className="h-3 w-3" />
                  نتائج البحث: {tools.length}
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-white/10 text-slate-300">
                  إجمالي النتائج: {tools.length}
                </Badge>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card/20 p-2 backdrop-blur-sm">
            <CategoryFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          </div>

          <div className="flex justify-start sm:justify-end">
            <ToolsSorter onSortChange={setSortBy} isArabic />
          </div>
        </motion.section>

        {showEnhancements && isDefaultView && (
          <section style={deferredSectionStyle}>
            <Suspense fallback={<div className="h-40 w-full rounded-2xl border border-white/10 bg-white/[0.02]" aria-hidden="true" />}>
              <RecommendedForYou />
            </Suspense>
          </section>
        )}

        <section className="min-h-[50vh]" style={deferredSectionStyle}>
          {isDefaultView ? (
            <Suspense fallback={<ToolsGrid tools={tools} isLoading />}>
              <ToolsTimeline
                tools={tools}
                onFetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            </Suspense>
          ) : (
            <ToolsGrid
              tools={tools}
              isLoading={isLoading}
              error={error}
              searchQuery={searchQuery}
              activeCategory={activeCategory}
              onFetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          )}

          {!isLoading && tools.length === 0 && (
            <div className="mt-8 flex flex-col items-center justify-center space-y-4 rounded-3xl border-2 border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
              <div className="rounded-full bg-white/5 p-4 text-slate-500">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-200">لا توجد نتائج مطابقة</h3>
              <p className="max-w-sm text-slate-400">جرّب كلمات بحث مختلفة أو أزل بعض الفلاتر لإظهار نتائج أكثر.</p>
              <button type="button" onClick={clearFilters} className="text-neon-cyan underline-offset-4 hover:underline">
                عرض كل الأدوات
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
