import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryFilters from "@/components/CategoryFilters";
import ToolsGrid from "@/components/ToolsGrid";
import ToolsTimeline from "@/components/ToolsTimeline";
import AddToolModal from "@/components/AddToolModal";
import Footer from "@/components/Footer";
import { useTools, type Category } from "@/hooks/useTools";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { useStructuredData } from "@/hooks/useStructuredData";
import { LayoutGrid, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('timeline');

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

  const tools = useMemo(() =>
    data?.pages.flatMap(page => page) ?? [],
    [data]
  );

  // Structured data for tool list
  const structuredDataItems = useMemo(
    () => tools.map((tool) => ({ id: tool.id, name: tool.title, url: tool.url })),
    [tools]
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
        <section aria-label="مقدمة وبحث" className="mb-4 sm:mb-6">
          <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        </section>

        {/* Filters */}
        <section
          aria-labelledby="filters-heading"
          className="
            mb-4 sm:mb-6
            rounded-2xl
            border
            bg-card/50
            px-3 sm:px-4
            py-3 sm:py-4
          "
        >
          <h2 id="filters-heading" className="sr-only">تصفية الأدوات</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CategoryFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-white/5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "gap-2 h-8 px-3 transition-all",
                  viewMode === 'grid'
                    ? "bg-neon-purple/20 text-neon-purple shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">شبكة</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('timeline')}
                className={cn(
                  "gap-2 h-8 px-3 transition-all",
                  viewMode === 'timeline'
                    ? "bg-neon-purple/20 text-neon-purple shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">تايم لاين</span>
              </Button>
            </div>
          </div>
        </section>
        {/* Tools Display */}
        <section
          aria-labelledby="tools-heading"
          className="
            rounded-2xl
            border
            bg-card/30
            px-3 sm:px-4
            py-3 sm:py-4
          "
        >
          <h2 id="tools-heading" className="sr-only">قائمة الأدوات</h2>

          {/* منطق العرض الذكي:
              - إذا لا يوجد بحث + التصنيف "الكل" + الوضع timeline → تايم لاين
              - إذا يوجد بحث أو تصنيف محدد → شبكة (للمرونة في التصفية)
              - الزر اليدوي يتجاوز هذا المنطق
          */}
          {(viewMode === 'timeline' || (!searchQuery && activeCategory === 'الكل')) && viewMode !== 'grid' ? (
            <ToolsTimeline tools={tools} />
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
        </section>

        {/* مساحة تنفّس أسفل الشبكة على الموبايل */}
        <div className="h-6 sm:h-8" />
      </main>

      <Footer />

      <AddToolModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
};

export default Index;
