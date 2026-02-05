import { useState, useMemo } from "react";
import { Helmet } from 'react-helmet-async';
import HeroSection from "@/components/HeroSection";
import TrendingTools from "@/components/TrendingTools";
import CategoryFilters from "@/components/CategoryFilters";
import ToolsGrid from "@/components/ToolsGrid";
import ToolsTimeline from "@/components/ToolsTimeline";
import LivePulse from "@/components/LivePulse";
import PersonaFilter, { PERSONAS, filterToolsByPersona, type PersonaId } from "@/components/PersonaFilter";
import RecommendedForYou from "@/components/RecommendedForYou";
import { useTools, type Category, type Tool } from "@/hooks/useTools";
import { useHybridSearch } from "@/hooks/useSemanticSearch";
import { useSEO } from "@/hooks/useSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import { Sparkles, Loader2, X, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSupabaseFunctionsBaseUrl } from "@/utils/supabaseUrl";

const Index = () => {
  const functionsBaseUrl = getSupabaseFunctionsBaseUrl();
  const ogImageUrl = functionsBaseUrl
    ? `${functionsBaseUrl}/og-image?title=${encodeURIComponent("\u0646\u0628\u0636 AI")}&category=${encodeURIComponent("\u062f\u0644\u064a\u0644\u0643 \u0627\u0644\u0630\u0643\u064a \u0644\u0623\u062f\u0648\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u0642\u0628\u0644")}`
    : "";

  useSEO({
    title: "الرئيسية",
    description: "نبض - دليلك الشامل لأفضل أدوات الذكاء الاصطناعي العربية والعالمية.",
    ogType: "website",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("الكل");
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>("all");

  const clearFilters = () => {
    setSelectedPersona("all");
    setActiveCategory("الكل");
    setSearchQuery("");
  };

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useTools({
    searchQuery,
    selectedPersona,
    category: activeCategory
  });

  const tools = useMemo(() => {
    return data?.pages.flatMap(page => page) ?? [];
  }, [data]);

  const personaCounts = useMemo(() => {
    if (!tools || tools.length === 0) return {};
    const counts: Record<string, number> = {};
    counts["all"] = tools.length;
    PERSONAS.forEach((persona) => {
      if (persona.id === 'all') return;
      const matchCount = tools.filter((t) =>
        persona.categories.some((cat) =>
          t.category?.toLowerCase().includes(cat.toLowerCase())
        )
      ).length;
      counts[persona.id] = matchCount;
    });
    return counts;
  }, [tools]);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch = searchQuery.trim() === '' ||
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

  return (
    <div className="relative min-h-screen bg-[#0f0f1a] overflow-x-hidden font-cairo text-right selection:bg-neon-purple selection:text-white" dir="rtl">

      {/* Avant-Garde Backgrounds */}
      <div className="fixed -top-[20%] right-[20%] w-[60vw] h-[60vw] bg-neon-purple/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed bottom-[10%] -left-[10%] w-[50vw] h-[50vw] bg-neon-blue/5 rounded-full blur-[180px] pointer-events-none" />

      <Helmet>
        <title>نبض AI | الدليل العربي الأول لأدوات الذكاء الاصطناعي</title>
        <meta name="description" content="اكتشف أفضل أدوات الذكاء الاصطناعي (ChatGPT, Midjourney, وغيرها) مع مراجعات عربية، مقارنات دقيقة، وفلاتر ذكية. دليلك الشامل لعام 2026." />
        <meta property="og:title" content="نبض AI | اكتشف أدوات المستقبل" />
        <meta property="og:description" content="أكبر مكتبة عربية لأدوات الذكاء الاصطناعي. ابحث، قارن، واختر الأداة المناسبة لك." />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[100] focus:rounded-xl focus:bg-background focus:px-4 focus:py-2 focus:shadow focus:ring-2 focus:ring-neon-purple"
      >
        تخطّي إلى المحتوى
      </a>

      <LivePulse />

      <main
        id="main-content"
        role="main"
        className="relative z-10 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-12"
      >

        {/* Section 1: Hero & Primary Search */}
        <section aria-label="البحث والاستكشاف" className="flex flex-col items-center text-center space-y-8 mb-4">
          <HeroSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearching={isLoading || isSemanticLoading}
          />
        </section>

        {/* Section 1.5: Trending Ticker (NEW) */}
        <section className="-mt-8 mb-4 animate-fade-in">
          <TrendingTools />
        </section>

        {/* Section 2: Persona Filter (Floating) */}
        <section className="sticky top-4 z-40 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="relative group backdrop-blur-xl bg-black/20 rounded-2xl border border-white/5 shadow-2xl shadow-black/10 transition-all duration-300 hover:bg-black/30 hover:shadow-neon-purple/10 p-2">
            <PersonaFilter
              currentPersona={selectedPersona}
              onSelect={(id) => setSelectedPersona(id as PersonaId)}
              counts={personaCounts}
            />

            {/* Reset Filter Button */}
            {(selectedPersona !== 'all' || activeCategory !== 'الكل' || searchQuery) && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-red-400 bg-black/40 px-4 py-2 rounded-full border border-white/10 hover:border-red-500/30 transition-all shadow-lg hover:shadow-red-500/10"
                >
                  <X className="w-3 h-3" />
                  مسح جميع الفلاتر
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Semantic Indicators & Categories */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-neon-purple rounded-full"></span>
              الأدوات المتاحة
            </h2>

            {/* Semantic Search Badge */}
            {searchQuery && (
              <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
                {isSemanticLoading ? (
                  <Badge variant="outline" className="gap-2 border-neon-purple/30 text-neon-purple bg-neon-purple/5 px-3 py-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    جاري التحليل الذكي...
                  </Badge>
                ) : isSemantic ? (
                  <Badge className="gap-1.5 bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 text-neon-purple border-neon-purple/30 px-3 py-1.5">
                    <Sparkles className="w-3 h-3" />
                    نتائج بحث ذكية
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-white/5 text-slate-400 gap-2">
                    <Search className="w-3 h-3" />
                    نتائج مباشرة
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="bg-card/20 backdrop-blur-sm border border-white/5 rounded-2xl p-2 sm:p-4 hover:border-white/10 transition-colors">
            <CategoryFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          </div>
        </section>

        {/* Section 4: Recommended (Only on default view) */}
        {!searchQuery && activeCategory === 'الكل' && selectedPersona === 'all' && (
          <section className="animate-in fade-in slide-in-from-bottom-5 duration-700">
            <RecommendedForYou />
          </section>
        )}

        {/* Section 5: Main Grid/Timeline */}
        <section className="min-h-[50vh]">
          {(!searchQuery && activeCategory === 'الكل') ? (
            <ToolsTimeline
              tools={displayTools || []}
              onFetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          ) : (
            <ToolsGrid
              tools={displayTools || []}
              isLoading={isLoading || isSemanticLoading}
              error={error}
              searchQuery={searchQuery}
              activeCategory={activeCategory}
              onFetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage && !isSemantic}
              isFetchingNextPage={isFetchingNextPage}
            />
          )}

          {/* Empty State */}
          {!isLoading && !isSemanticLoading && displayTools.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.02]">
              <div className="p-4 rounded-full bg-white/5 text-slate-500">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-300">لم يتم العثور على نتائج</h3>
              <p className="text-slate-500 max-w-sm">جرب تغيير مصطلحات البحث أو إزالة بعض الفلاتر لرؤية المزيد من الأدوات.</p>
              <button onClick={clearFilters} className="text-neon-purple hover:underline underline-offset-4">عرض كل الأدوات</button>
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default Index;
