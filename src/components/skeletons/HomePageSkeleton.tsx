import { Skeleton } from "@/components/ui/skeleton";

/**
 * NavbarSkeleton - يحاكي شكل شريط التنقل
 */
const NavbarSkeleton = () => (
  <nav className="sticky top-0 z-50 glass border-b border-border/50" dir="rtl">
    <div className="container mx-auto max-w-7xl px-4 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        {/* Logo Skeleton */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-neon-purple/20" />
          <Skeleton className="h-6 w-20 sm:w-24 rounded bg-muted/50" />
        </div>

        {/* Desktop Menu Skeleton */}
        <div className="hidden md:flex items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-lg bg-gradient-to-r from-neon-purple/20 to-neon-blue/20" />
          <Skeleton className="h-10 w-20 rounded-lg border border-border/50 bg-muted/30" />
        </div>

        {/* Mobile Menu Button Skeleton */}
        <Skeleton className="md:hidden h-10 w-10 rounded-lg bg-muted/30" />
      </div>
    </div>
  </nav>
);

/**
 * HeroSkeleton - يحاكي قسم البطل مع حقل البحث
 */
const HeroSkeleton = () => (
  <section className="relative py-12 sm:py-16 md:py-20 px-4 text-center overflow-hidden" dir="rtl">
    {/* Background Effects - نفس التأثيرات الأصلية */}
    <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-neon-purple/20 rounded-full blur-[100px] sm:blur-[150px] -z-10 animate-pulse" />
    <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-neon-blue/20 rounded-full blur-[100px] sm:blur-[150px] -z-10 animate-pulse" />

    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Title Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-10 sm:h-14 md:h-16 lg:h-20 w-full max-w-2xl mx-auto rounded-lg bg-gradient-to-r from-neon-purple/20 via-neon-blue/20 to-neon-purple/20" />
        <Skeleton className="h-8 sm:h-10 md:h-12 w-3/4 mx-auto rounded-lg bg-muted/30" />
      </div>

      {/* Subtitle Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 sm:h-6 w-4/5 mx-auto rounded bg-muted/40" />
        <Skeleton className="h-5 sm:h-6 w-3/5 mx-auto rounded bg-muted/40" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="relative max-w-2xl mx-auto mt-6 sm:mt-8 md:mt-10">
        <div className="glass-card rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border border-neon-purple/20">
          <div className="relative flex items-center">
            <Skeleton className="absolute right-3 sm:right-4 h-5 w-5 sm:h-6 sm:w-6 rounded bg-muted/40" />
            <Skeleton className="w-full h-12 sm:h-14 rounded-lg bg-muted/20" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

/**
 * CategoryFiltersSkeleton - يحاكي أزرار التصفية
 */
const CategoryFiltersSkeleton = () => (
  <section
    className="mb-4 sm:mb-6 rounded-2xl border bg-card/50 px-3 sm:px-4 py-3 sm:py-4"
    dir="rtl"
    aria-label="تحميل فلاتر التصنيفات"
  >
    <div className="flex flex-wrap gap-2 justify-center">
      {/* 6 Category Buttons */}
      {[90, 60, 75, 60, 70, 80].map((width, index) => (
        <Skeleton
          key={index}
          className={`h-9 sm:h-10 rounded-full bg-muted/40 ${index === 0 ? 'bg-neon-purple/30' : ''}`}
          style={{ width: `${width}px` }}
        />
      ))}
    </div>
  </section>
);

/**
 * ToolCardSkeleton - يحاكي بطاقة الأداة الواحدة
 */
const ToolCardSkeleton = ({ index = 0 }: { index?: number }) => (
  <article
    className="glass-card flex flex-col h-full rounded-xl p-5 animate-pulse"
    style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
    dir="rtl"
    aria-label="جاري تحميل الأداة"
  >
    {/* Top Section: Icon & Content */}
    <div className="flex items-start gap-4 mb-4">
      {/* Icon Container */}
      <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl shrink-0 bg-gradient-to-br from-neon-purple/20 to-neon-blue/20" />

      {/* Title & Category */}
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-5 w-3/4 rounded bg-muted/50" />
        <Skeleton className="h-3 w-16 rounded bg-muted/30" />
      </div>
    </div>

    {/* Description */}
    <div className="space-y-2 mb-4 flex-1">
      <Skeleton className="h-4 w-full rounded bg-muted/30" />
      <Skeleton className="h-4 w-4/5 rounded bg-muted/30" />
    </div>

    {/* Footer: Rating, Pricing, Action */}
    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
      <div className="flex items-center gap-2">
        {/* Rating */}
        <Skeleton className="h-7 w-16 rounded-md bg-muted/30" />
        {/* Pricing Badge */}
        <Skeleton className="h-7 w-14 rounded-full bg-muted/30" />
      </div>

      {/* Action Button */}
      <Skeleton className="h-8 w-8 rounded-full bg-muted/30" />
    </div>
  </article>
);

/**
 * ToolsGridSkeleton - يحاكي شبكة البطاقات
 */
const ToolsGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <section
    className="rounded-2xl border bg-card/30 px-3 sm:px-4 py-3 sm:py-4"
    aria-label="جاري تحميل الأدوات"
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ToolCardSkeleton key={index} index={index} />
      ))}
    </div>
  </section>
);

/**
 * FooterSkeleton - يحاكي تذييل الصفحة
 */
const FooterSkeleton = () => (
  <footer className="border-t border-border/50 py-6 mt-8" dir="rtl">
    <div className="container mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <Skeleton className="h-4 w-48 rounded bg-muted/30" />
      <div className="flex gap-4">
        <Skeleton className="h-8 w-8 rounded-full bg-muted/30" />
        <Skeleton className="h-8 w-8 rounded-full bg-muted/30" />
        <Skeleton className="h-8 w-8 rounded-full bg-muted/30" />
      </div>
    </div>
  </footer>
);

/**
 * HomePageSkeleton - الهيكل العظمي الكامل للصفحة الرئيسية
 * يُستخدم كـ fallback في Suspense لحل مشكلة Lighthouse "No Content Rendered"
 */
const HomePageSkeleton = () => {
  return (
    <div
      className="min-h-screen bg-background flex flex-col overflow-x-hidden"
      role="main"
      aria-busy="true"
      aria-label="جاري تحميل الصفحة الرئيسية"
    >
      <NavbarSkeleton />

      <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Hero Section */}
        <section aria-label="جاري تحميل المقدمة" className="mb-4 sm:mb-6">
          <HeroSkeleton />
        </section>

        {/* Category Filters */}
        <CategoryFiltersSkeleton />

        {/* Tools Grid */}
        <ToolsGridSkeleton count={6} />

        {/* Bottom Spacing */}
        <div className="h-6 sm:h-8" />
      </main>

      <FooterSkeleton />
    </div>
  );
};

// تصدير المكونات الفرعية للاستخدام المستقل
export {
  NavbarSkeleton,
  HeroSkeleton,
  CategoryFiltersSkeleton,
  ToolCardSkeleton,
  ToolsGridSkeleton,
  FooterSkeleton,
};

export default HomePageSkeleton;
