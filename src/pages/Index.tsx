import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CategoryFilters from "@/components/CategoryFilters";
import ToolsGrid from "@/components/ToolsGrid";
import AddToolModal from "@/components/AddToolModal";
import Footer from "@/components/Footer";
import { useTools, type Category } from "@/hooks/useTools";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { useStructuredData } from "@/hooks/useStructuredData";

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
          <CategoryFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        </section>
        {/* Grid */}
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
