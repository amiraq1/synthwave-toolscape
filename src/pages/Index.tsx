import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Compass, GitCompareArrows, LayoutGrid, Library, Loader2, Search, Sparkles, Workflow, ArrowDown, ArrowUpRight } from "lucide-react";
import AIMosaicShowcase from "@/components/AIMosaicShowcase";
import CategoryFilters from "@/components/CategoryFilters";
import PersonaFilter, { PERSONAS, filterToolsByPersona, type PersonaId } from "@/components/PersonaFilter";
import RecommendedForYou from "@/components/RecommendedForYou";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import ToolLogo from "@/components/ToolLogo";
import ToolRow from "@/components/ToolRow";
import ToolsGrid from "@/components/ToolsGrid";
import ToolsTimeline from "@/components/ToolsTimeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useTools, type Category, type Tool } from "@/hooks/useTools";
import { useHybridSearch } from "@/hooks/useSemanticSearch";
import { useSEO } from "@/hooks/useSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import { getCategoryLabel, getSupabaseFunctionsBaseUrl } from "@synthwave/utils";
import { useTranslation } from "react-i18next";

const EditorialHeading = ({
  kicker,
  title,
  description,
  invert = false,
  className,
}: {
  kicker: string;
  title: string;
  description: string;
  invert?: boolean;
  className?: string;
}) => (
  <div className={cn("space-y-3", className)}>
    <span className={cn("editorial-kicker", invert && "text-white/60 border-white/15 bg-white/10")}>
      {kicker}
    </span>
    <div className="space-y-2">
      <h2 className={cn("font-editorial text-3xl font-semibold tracking-tight sm:text-4xl", invert ? "text-white" : "text-slate-950")}>
        {title}
      </h2>
      <p className={cn("max-w-2xl text-sm leading-7 sm:text-[15px]", invert ? "text-white/72" : "text-slate-600")}>
        {description}
      </p>
    </div>
  </div>
);

const trimDescription = (value?: string | null, max = 96) => {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max).trim()}...` : value;
};

const Index = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isToolsRoute = location.pathname === "/tools";
  const toolsPageDescription = "استكشف أدوات الذكاء الاصطناعي، صفّها بسرعة، وقارن بينها من صفحة الأدوات مباشرة.";
  const pageTitle = isToolsRoute ? "الأدوات | نبض AI" : t("index.meta_title");
  const pageDescription = isToolsRoute ? toolsPageDescription : t("index.meta_desc");
  const pageOgTitle = isToolsRoute ? "الأدوات | نبض AI" : t("index.og_title");
  const pageOgDescription = isToolsRoute ? toolsPageDescription : t("index.og_desc");
  const ogImageUrl = `${getSupabaseFunctionsBaseUrl()}/og-image?title=${encodeURIComponent("نبض AI")}&category=${encodeURIComponent("دليلك الذكي لأدوات المستقبل")}`;

  useSEO({
    title: "الرئيسية",
    description: "نبض - دليلك الشامل لأفضل أدوات الذكاء الاصطناعي العربية والعالمية.",
    ogType: "website",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("الكل");
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>("all");

  const isFilteredView = searchQuery.trim().length > 0 || activeCategory !== "الكل" || selectedPersona !== "all";
  const personaLabel = PERSONAS.find((persona) => persona.id === selectedPersona)?.label || PERSONAS[0].label;

  const resetExploration = () => {
    setSearchQuery("");
    setActiveCategory("الكل");
    setSelectedPersona("all");
  };

  const scrollToTools = () => {
    const toolsSection = document.getElementById("tools-heading");
    toolsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  });

  const tools = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);
  const visibleToolsCount = tools.length;
  const totalToolsCount = data?.totalCount ?? visibleToolsCount;
  const shouldShowLoadedCount = totalToolsCount > visibleToolsCount;

  const personaCounts = useMemo<Record<string, number> | undefined>(() => {
    if (visibleToolsCount === 0 || visibleToolsCount !== totalToolsCount) {
      return undefined;
    }

    const counts: Record<string, number> = { all: totalToolsCount };

    PERSONAS.forEach((persona) => {
      if (persona.id === "all") return;

      counts[persona.id] = tools.filter((tool) =>
        persona.categories.some((category) =>
          tool.category?.toLowerCase().includes(category.toLowerCase())
        )
      ).length;
    });

    return counts;
  }, [tools, totalToolsCount, visibleToolsCount]);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description?.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedPersona === "all") return matchesSearch;

      const filtered = filterToolsByPersona([tool], selectedPersona);
      return matchesSearch && filtered.length > 0;
    });
  }, [tools, searchQuery, selectedPersona]);

  const {
    semanticTools,
    isSemanticLoading,
    isSemantic,
  } = useHybridSearch(searchQuery, filteredTools.length, 3);

  const displayTools = useMemo(() => {
    if (isSemantic && semanticTools.length > 0) {
      return semanticTools as unknown as Tool[];
    }

    return filteredTools;
  }, [filteredTools, semanticTools, isSemantic]);

  const effectiveToolsCount = isSemantic && semanticTools.length > 0 ? displayTools.length : totalToolsCount;

  const resultsLabel = useMemo(() => {
    if (searchQuery.trim()) {
      if (isSemantic && semanticTools.length > 0) {
        return `نتائج البحث الذكية: ${displayTools.length}`;
      }

      return shouldShowLoadedCount
        ? `نتائج البحث المعروضة: ${visibleToolsCount} من ${totalToolsCount}`
        : `نتائج البحث: ${totalToolsCount}`;
    }

    return shouldShowLoadedCount
      ? `المعروض الآن: ${visibleToolsCount} من ${totalToolsCount}`
      : `إجمالي النتائج: ${totalToolsCount}`;
  }, [
    displayTools.length,
    isSemantic,
    searchQuery,
    semanticTools.length,
    shouldShowLoadedCount,
    totalToolsCount,
    visibleToolsCount,
  ]);

  const showcaseTools = useMemo(() => {
    const source = displayTools.length > 0 ? displayTools : tools;
    return source.slice(0, 8);
  }, [displayTools, tools]);

  const radarTools = useMemo(() => {
    const source = displayTools.length > 0 ? displayTools : tools;
    return source.slice(0, 4);
  }, [displayTools, tools]);

  const compareTools = useMemo(() => {
    const source = displayTools.length > 0 ? displayTools : tools;
    return source.slice(0, 3);
  }, [displayTools, tools]);

  const categorySignals = useMemo(() => {
    const source = displayTools.length > 0 ? displayTools : tools;

    return Array.from(
      source.reduce((acc, tool) => {
        const key = tool.category || "الكل";
        acc.set(key, (acc.get(key) || 0) + 1);
        return acc;
      }, new Map<string, number>())
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([category, count]) => ({
        category,
        count,
      }));
  }, [displayTools, tools]);

  const structuredDataItems = useMemo(
    () => displayTools.map((tool) => ({ id: tool.id, name: tool.title, url: tool.url })),
    [displayTools]
  );

  useStructuredData({
    type: "itemList",
    name: "أدوات الذكاء الاصطناعي",
    description: "قائمة بأفضل أدوات الذكاء الاصطناعي",
    items: structuredDataItems,
  });

  const { data: homeStats } = useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      const [{ count: toolsCount }, { count: reviewsCount }] = await Promise.all([
        supabase.from("tools").select("*", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
      ]);

      return {
        toolsCount: toolsCount || 0,
        reviewsCount: reviewsCount || 0,
      };
    },
    staleTime: 1000 * 60 * 10,
  });

  const summaryText = useMemo(() => {
    if (searchQuery.trim()) {
      return t("index.results_count_query", { count: effectiveToolsCount, query: searchQuery });
    }

    if (activeCategory !== "الكل") {
      return t("index.results_count_category", { count: effectiveToolsCount, category: getCategoryLabel(activeCategory) });
    }

    if (selectedPersona !== "all") {
      return t("index.results_count_persona", { count: effectiveToolsCount, persona: personaLabel });
    }

    return t("index.results_count", { count: totalToolsCount || homeStats?.toolsCount || displayTools.length });
  }, [activeCategory, displayTools.length, effectiveToolsCount, homeStats?.toolsCount, personaLabel, searchQuery, selectedPersona, t, totalToolsCount]);

  const stats = [
    {
      icon: Library,
      value: homeStats?.toolsCount?.toLocaleString("en-US") || "…",
      label: t("index.panel_tools"),
    },
    {
      icon: Sparkles,
      value: homeStats?.reviewsCount?.toLocaleString("en-US") || "…",
      label: t("index.panel_reviews"),
    },
    {
      icon: LayoutGrid,
      value: String(categorySignals.length || 4),
      label: t("index.panel_categories"),
    },
  ];

  return (
    <div className="home-editorial-shell min-h-screen overflow-x-hidden text-right" dir="rtl">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageOgTitle} />
        <meta property="og:description" content={pageOgDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageOgTitle} />
        <meta name="twitter:description" content={pageOgDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:shadow"
      >
        {t("index.skip_to_content")}
      </a>

      <main
        id="main-content"
        role="main"
        className="relative mx-auto flex w-full max-w-[1380px] flex-1 flex-col gap-8 px-4 pb-12 pt-20 sm:px-6 lg:gap-10 lg:px-8 lg:pt-24"
      >
        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] xl:gap-8">
          <div className="editorial-paper editorial-grid relative overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.18),_transparent_68%)]" />
            <div className="relative space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="editorial-kicker">{t("index.hero_overline")}</span>
                {isSemantic && (
                  <Badge className="gap-1.5 border-0 bg-emerald-950/10 px-3 py-1.5 text-emerald-800">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t("index.signal_semantic")}
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                <h1 className="font-editorial text-4xl font-semibold leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl xl:text-[4.7rem]">
                  {t("hero.title")}
                </h1>
                <p className="max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                  {t("index.hero_note")}
                </p>
              </div>

              <div className="editorial-search-shell">
                <SearchAutocomplete
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSearch={setSearchQuery}
                  className="z-20"
                  inputClassName="home-search-input h-16 rounded-[24px] border-none bg-transparent px-12 text-lg text-slate-950 placeholder:text-slate-500 shadow-none focus:ring-0"
                  placeholder={t("search.ai_tool")}
                />
                <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <Search className="h-4 w-4 text-teal-700" />
                  {t("index.search_hint")}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={scrollToTools}
                  className="h-12 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  <ArrowDown className="ms-2 h-4 w-4" />
                  {t("hero.explore_tools")}
                </Button>

                <Link to="/workflow/new">
                  <Button
                    variant="outline"
                    className="h-12 rounded-full border-slate-300 bg-white/70 px-6 text-sm font-semibold text-slate-900 hover:bg-white"
                  >
                    <Workflow className="ms-2 h-4 w-4" />
                    {t("hero.try_workflow")}
                  </Button>
                </Link>

                {isFilteredView && (
                  <Button
                    variant="ghost"
                    className="h-12 rounded-full px-5 text-sm font-medium text-slate-600 hover:bg-slate-900/5 hover:text-slate-950"
                    onClick={resetExploration}
                  >
                    {t("index.reset_all")}
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {categorySignals.map((signal) => (
                  <span key={signal.category} className="editorial-chip">
                    {getCategoryLabel(signal.category)}
                    <span className="rounded-full bg-slate-900/8 px-2 py-0.5 text-[11px] text-slate-700">
                      {signal.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <aside className="editorial-ink-panel relative overflow-hidden p-6 sm:p-7">
            <div className="space-y-6">
              <EditorialHeading
                kicker={t("index.panel_title")}
                title={t("index.panel_heading")}
                description={t("index.panel_desc")}
                invert
              />

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {stats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-3xl font-semibold tracking-tight text-white">{item.value}</p>
                        <p className="text-xs leading-6 text-white/60">{item.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-[28px] border border-white/10 bg-[#111827] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">{t("index.signal_live")}</p>
                    <p className="mt-1 text-sm text-white/70">{summaryText}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60">
                    {isSemantic ? t("index.signal_semantic") : t("index.signal_classic")}
                  </span>
                </div>

                <div className="space-y-3">
                  {radarTools.slice(0, 3).map((tool) => (
                    <Link
                      key={tool.id}
                      to={`/tool/${tool.id}`}
                      className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 transition-colors hover:border-white/15 hover:bg-white/10"
                    >
                      <ToolLogo
                        title={tool.title}
                        imageUrl={tool.image_url}
                        category={tool.category}
                        toolUrl={tool.url}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{tool.title}</p>
                        <p className="mt-1 truncate text-xs text-white/55">{getCategoryLabel(tool.category)}</p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-white/35" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </section>

        {!isFilteredView && showcaseTools.length > 0 && (
          <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr] xl:gap-8">
            <div className="space-y-4">
              <EditorialHeading
                kicker={t("index.sections.radar")}
                title={t("showcase.heading")}
                description={t("index.sections.radar_desc")}
              />
              <AIMosaicShowcase tools={showcaseTools} />
            </div>

            <div className="editorial-paper p-6 sm:p-7">
              <EditorialHeading
                kicker={t("index.sections.desk")}
                title={t("index.sections.desk_title")}
                description={t("index.sections.desk_desc")}
              />

              <div className="mt-6 space-y-3">
                {radarTools.map((tool) => (
                  <ToolRow key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          </section>
        )}

        {!isFilteredView && <RecommendedForYou />}

        <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr] xl:gap-8">
          <div className="editorial-paper p-6 sm:p-7">
            <EditorialHeading
              kicker={t("index.sections.persona")}
              title={t("index.sections.persona_title")}
              description={t("index.sections.persona_desc")}
            />

            <div className="mt-6 rounded-[28px] border border-black/8 bg-white/75 p-4 sm:p-5">
              <PersonaFilter
                currentPersona={selectedPersona}
                onSelect={(id) => setSelectedPersona(id as PersonaId)}
                counts={personaCounts}
              />

              <div className="rounded-[24px] border border-black/8 bg-[#f8f5ef]">
                <CategoryFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
              </div>
            </div>
          </div>

          {!isFilteredView && compareTools.length > 0 ? (
            <div className="editorial-ink-panel p-6 sm:p-7">
              <EditorialHeading
                kicker={t("index.compare_ready")}
                title={t("index.compare_ready_title")}
                description={t("index.compare_ready_desc")}
                invert
              />

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {compareTools.map((tool, index) => (
                  <Link
                    key={tool.id}
                    to={`/tool/${tool.id}`}
                    className="rounded-[24px] border border-white/10 bg-white/5 p-4 transition-colors hover:border-white/20 hover:bg-white/10"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span className="text-[11px] uppercase tracking-[0.3em] text-white/35">
                        0{index + 1}
                      </span>
                      <ToolLogo
                        title={tool.title}
                        imageUrl={tool.image_url}
                        category={tool.category}
                        toolUrl={tool.url}
                        size="sm"
                      />
                    </div>
                    <h3 className="line-clamp-1 text-sm font-semibold text-white">{tool.title}</h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-6 text-white/60">
                      {trimDescription(tool.description, 86)}
                    </p>
                    <span className="mt-4 inline-flex rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/65">
                      {getCategoryLabel(tool.category)}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link to="/compare">
                  <Button className="h-11 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-white/90">
                    <GitCompareArrows className="ms-2 h-4 w-4" />
                    {t("compare.compare_btn")}
                  </Button>
                </Link>
                <span className="text-sm text-white/55">{t("index.compare_ready_hint")}</span>
              </div>
            </div>
          ) : (
            <div className="editorial-paper p-6 sm:p-7">
              <EditorialHeading
                kicker={t("index.sections.results")}
                title={t("index.sections.results_title")}
                description={t("index.sections.results_desc")}
              />

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] border border-black/8 bg-[#fffaf0] p-4">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                    <Compass className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-950">{t("index.signal_classic")}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{summaryText}</p>
                </div>
                <div className="rounded-[24px] border border-black/8 bg-white p-4">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-950">{t("index.signal_live")}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {isSemantic ? t("index.signal_semantic_desc") : t("index.signal_classic_desc")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section
          id="tools-heading"
          aria-labelledby="tools-heading-title"
          className="editorial-paper overflow-hidden p-5 sm:p-6 lg:p-8"
        >
          <div className="flex flex-col gap-4 border-b border-black/8 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <EditorialHeading
              kicker={isFilteredView ? t("index.sections.results") : t("index.sections.library")}
              title={isFilteredView ? t("index.sections.results_title") : t("index.sections.library_title")}
              description={isFilteredView ? t("index.sections.results_desc") : t("index.sections.library_desc")}
              className="max-w-3xl"
            />

            <div className="flex flex-wrap items-center gap-2 sm:justify-end" aria-live="polite">
              <Badge variant="outline" className="gap-1 rounded-full border-black/10 bg-black/5 px-3 py-1 text-slate-700">
                <Library className="h-3.5 w-3.5" />
                {resultsLabel}
              </Badge>

              {isSemanticLoading && (
                <Badge variant="outline" className="gap-1 rounded-full border-emerald-700/20 bg-emerald-700/10 px-3 py-1 text-emerald-800">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {t("index.smart_search")}
                </Badge>
              )}

              {isSemantic && !isSemanticLoading && (
                <Badge className="gap-1 rounded-full border-0 bg-slate-950 px-3 py-1 text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("index.smart_results")}
                </Badge>
              )}

              {isFilteredView && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-4 text-slate-600 hover:bg-slate-900/5 hover:text-slate-950"
                  onClick={resetExploration}
                >
                  {t("index.reset_all")}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-[28px] bg-slate-950/98 px-3 py-4 sm:px-4 sm:py-5">
            {!isFilteredView && !isLoading ? (
              <ToolsTimeline
                tools={displayTools}
                onFetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            ) : (
              <ToolsGrid
                tools={displayTools}
                isLoading={isLoading || isSemanticLoading}
                error={error}
                searchQuery={searchQuery}
                activeCategory={activeCategory}
                onFetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage && !isSemantic}
                isFetchingNextPage={isFetchingNextPage}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
