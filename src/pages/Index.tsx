import { useState, useMemo, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryFilters from "@/components/CategoryFilters";
import ToolsGrid from "@/components/ToolsGrid";
import ToolsTimeline from "@/components/ToolsTimeline";
// Lazy load AddToolModal
const AddToolModal = lazy(() => import("@/components/AddToolModal"));
import Footer from "@/components/Footer";
import LivePulse from "@/components/LivePulse";
import PersonaFilter, { filterToolsByPersona, type PersonaId } from "@/components/PersonaFilter";
import { useTools, type Category, type Tool } from "@/hooks/useTools";
import { useHybridSearch } from "@/hooks/useSemanticSearch";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import { Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  useSEO({
    title: "الرئيسية",
    description:
      "نبض - دليلك الشامل لأفضل أدوات الذكاء الاصطناعي العربية والعالمية. اكتشف أدوات النصوص والصور والفيديو والبرمجة.",
    keywords: "ذكاء اصطناعي، أدوات AI، ChatGPT، Midjourney، أدوات نصوص، أدوات صور",
    ogType: "website",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("الكل");
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // ... (rest of hook calls remain same)

  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useTools(searchQuery, activeCategory);

  const tools = useMemo(() => {
    const rawTools = data?.pages.flatMap(page => page) ?? [];
    return rawTools;
  }, [data]);

  // Apply combined filters: search + persona
  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      // 1. Search filter (already handled by backend, but extra client-side filtering for persona)
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

  // Hybrid Search: Falls back to semantic search when client-side results are low
  const {
    semanticTools,
    isSemanticLoading,
    isSemantic,
  } = useHybridSearch(searchQuery, filteredTools.length, 3);

  // Determine which tools to display
  const displayTools = useMemo(() => {
    // If semantic search returned results and client-side is empty/low
    if (isSemantic && semanticTools.length > 0) {
      return semanticTools as unknown as Tool[];
    }
    return filteredTools;
  }, [filteredTools, semanticTools, isSemantic]);

  // Structured data for tool list
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

  const handleAddClick = () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول للمشاركة",
        description: "سجل دخولك لإضافة أداة جديدة",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    setIsAddModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Skip link (مهم للموبايل + قارئات الشاشة) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[100] focus:rounded-xl focus:bg-background focus:px-4 focus:py-2 focus:shadow"
      >
        تخطّي إلى المحتوى
      </a>

      <Navbar onAddClick={handleAddClick} />

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
          <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        </section>

        {/* Persona Filter - أنا ... */}
        <div className="container mx-auto mb-6">
          <PersonaFilter currentPersona={selectedPersona} onSelect={setSelectedPersona} />
        </div>

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

        {/* Tools Display - Enhanced styling */}
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

      <Footer />

      {/* Lazy Load AddToolModal only when requested */}
      {isAddModalOpen && (
        <Suspense fallback={null}>
          <AddToolModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
        </Suspense>
      )}
    </div>
  );
};

export default Index;
