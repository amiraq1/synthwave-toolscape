import { useState, useMemo } from "react";
import { Helmet } from 'react-helmet-async';
import HeroSection from "@/components/HeroSection";
import CategoryFilters from "@/components/CategoryFilters";
import ToolsGrid from "@/components/ToolsGrid";
import ToolsTimeline from "@/components/ToolsTimeline";
import LivePulse from "@/components/LivePulse";
import PersonaFilter, { PERSONAS, filterToolsByPersona, type PersonaId } from "@/components/PersonaFilter";
import RecommendedForYou from "@/components/RecommendedForYou";
import FeaturedShortlist from "@/components/FeaturedShortlist";
import { useTools, type Category, type Tool } from "@/hooks/useTools";
import { useHybridSearch } from "@/hooks/useSemanticSearch";
import { useSEO } from "@/hooks/useSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import { Sparkles, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  // رابط مشروعك (تأكد من المعرف)
  const PROJECT_REF = "iazvsdwkbfzjhscyfvec";
  const ogImageUrl = `https://${PROJECT_REF}.supabase.co/functions/v1/og-image?title=${encodeURIComponent("نبض AI")}&category=${encodeURIComponent("دليلك الذكي لأدوات المستقبل")}`;

  // Initial SEO - we override title/description with Helmet below for stronger control
  useSEO({
    title: "الرئيسية",
    description: "نبض - دليلك الشامل لأفضل أدوات الذكاء الاصطناعي العربية والعالمية.",
    ogType: "website",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("الكل");
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>("all");

  // دالة لإعادة كل شيء للوضع الافتراضي
  const clearFilters = () => {
    setSelectedPersona("all");
  };

  // ... (Hooks calls)
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
    const rawTools = data?.pages.flatMap(page => page) ?? [];
    return rawTools;
  }, [data]);

  // 🧮 حساب العدادات لكل وظيفة
  const personaCounts = useMemo(() => {
    if (!tools || tools.length === 0) return {};

    const counts: Record<string, number> = {};

    // 1. حساب الكل
    counts["all"] = tools.length;

    // 2. حساب باقي الوظائف
    PERSONAS.forEach((persona) => {
      if (persona.id === 'all') return;

      // نعد كم أداة تطابق تصنيفات هذه الوظيفة
      const matchCount = tools.filter((t) =>
        persona.categories.some((cat) =>
          t.category?.toLowerCase().includes(cat.toLowerCase())
        )
      ).length;

      counts[persona.id] = matchCount;
    });

    return counts;
  }, [tools]);

  // Apply combined filters: search + persona
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      // 1. Search filter
      const matchesSearch = searchQuery.trim() === '' ||
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // 2. Persona filter
      if (selectedPersona === "all") return matchesSearch;

      const filtered = filterToolsByPersona([tool], selectedPersona);
      const matchesPersona = filtered.length > 0;

      return matchesSearch && matchesPersona;
    });
  }, [tools, searchQuery, selectedPersona]);

  // Hybrid Search
  const {
    semanticTools,
    isSemanticLoading,
    isSemantic,
  } = useHybridSearch(searchQuery, filteredTools.length, 3);

  // Determine which tools to display
  const displayTools = useMemo(() => {
    if (isSemantic && semanticTools.length > 0) {
      return semanticTools as unknown as Tool[];
    }
    return filteredTools;
  }, [filteredTools, semanticTools, isSemantic]);

  // Structured data
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
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden font-cairo text-right" dir="rtl">
      {/* 👇 تحسينات SEO للصفحة الرئيسية */}
      <Helmet>
        <title>نبض AI | الدليل العربي الأول لأدوات الذكاء الاصطناعي</title>
        <meta name="description" content="اكتشف أفضل أدوات الذكاء الاصطناعي (ChatGPT, Midjourney, وغيرها) مع مراجعات عربية، مقارنات دقيقة، وفلاتر ذكية. دليلك الشامل لعام 2026." />

        {/* Open Graph */}
        <meta property="og:title" content="نبض AI | اكتشف أدوات المستقبل" />
        <meta property="og:description" content="أكبر مكتبة عربية لأدوات الذكاء الاصطناعي. ابحث، قارن، واختر الأداة المناسبة لك." />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[100] focus:rounded-xl focus:bg-background focus:px-4 focus:py-2 focus:shadow"
      >
        تخطّي إلى المحتوى
      </a>

      {/* Navbar Removed - Handled in App.tsx */}

      {/* شريط النبض المباشر */}
      <LivePulse />

      <main
        id="main-content"
        role="main"
        className="
          flex-1
          w-full
          mx-auto
          max-w-7xl
          px-4 sm:px-6 lg:px-8
          py-4 sm:py-6
        "
      >
        {/* Hero */}
        <section aria-label="مقدمة وبحث" className="mb-8 sm:mb-12">
          <HeroSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearching={isLoading || isSemanticLoading}
          />
        </section>

        {/* Persona Filter - أنا ... */}
        <div className="container mx-auto px-4 relative group mb-6">
          <PersonaFilter
            currentPersona={selectedPersona}
            onSelect={(id) => setSelectedPersona(id as PersonaId)}
            counts={personaCounts}
          />

          {/* زر إعادة التعيين يظهر فقط إذا لم نكن في "الكل" */}
          {selectedPersona !== 'all' && (
            <div className="flex justify-center -mt-4 mb-6 animate-in fade-in slide-in-from-top-2">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors bg-white/5 px-4 py-1.5 rounded-full border border-white/10 hover:border-red-500/30"
              >
                <X className="w-3 h-3" />
                مسح الفلتر
              </button>
            </div>
          )}
        </div>

        {/* Shortlists Section - New Feature */}
        <FeaturedShortlist />

        {/* Recommended For You */}
        <RecommendedForYou />

        {/* Category Filters */}
        <section
          aria-labelledby="filters-heading"
          className="
            mb-6 sm:mb-8
            rounded-2xl
            border border-white/10
            bg-card/40
            backdrop-blur-sm
            px-4 sm:px-6
            py-4 sm:py-5
            section-divider
          "
        >
          <h2 id="filters-heading" className="sr-only">تصفية الأدوات</h2>
          <CategoryFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        </section>

        {/* Tools Display */}
        <section
          aria-labelledby="tools-heading"
          className="
            rounded-2xl
            border border-white/10
            bg-card/30
            backdrop-blur-sm
            px-4 sm:px-6
            py-5 sm:py-6
          "
        >
          <div className="flex items-center justify-between mb-4">
            <h2 id="tools-heading" className="sr-only">قائمة الأدوات</h2>

            {/* Semantic Search Indicator */}
            {searchQuery && (
              <div className="flex items-center gap-2">
                {isSemanticLoading && (
                  <Badge variant="outline" className="gap-1 text-xs border-neon-purple/30 text-neon-purple animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    بحث ذكي...
                  </Badge>
                )}
                {isSemantic && !isSemanticLoading && (
                  <Badge className="gap-1.5 text-xs bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 text-neon-purple border border-neon-purple/30">
                    <Sparkles className="w-3 h-3" />
                    نتائج بحث ذكية 🤖
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Logic: Show Timeline by default, Grid when searching/filtering */}
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
        </section>

        {/* مساحة تنفّس أسفل الشبكة على الموبايل */}
        <div className="h-6 sm:h-8" />
      </main>

      {/* Footer Removed - Handled in App.tsx */}

    </div>
  );
};

export default Index;
