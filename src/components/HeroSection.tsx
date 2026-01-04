import { Search, Sparkles, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const HeroSection = ({ searchQuery, onSearchChange }: HeroSectionProps) => {
  const scrollToTools = () => {
    const toolsSection = document.getElementById('tools-heading');
    toolsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-12 sm:py-16 md:py-20 px-4 text-center overflow-hidden" dir="rtl">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-neon-purple/30 rounded-full blur-[100px] sm:blur-[150px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-neon-blue/30 rounded-full blur-[100px] sm:blur-[150px] -z-10 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute inset-0 opacity-20 -z-10" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "24px 24px" }} />

      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-tight">
          <span className="gradient-text">نبض.. دليلك الذكي لأدوات المستقبل</span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto px-2">
          اكتشف أفضل أدوات الذكاء الاصطناعي التي ستغير طريقة عملك وإبداعك
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Button
            onClick={scrollToTools}
            size="lg"
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 text-white gap-2 px-6 py-6 text-base sm:text-lg"
          >
            <Sparkles className="h-5 w-5" />
            استكشف الأدوات
          </Button>
          <Link to="/about">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 px-6 py-6 text-base sm:text-lg border-neon-purple/50 hover:bg-neon-purple/10"
            >
              تعرف على نبض
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mt-6 sm:mt-8 md:mt-10">
          <div className="glass-card rounded-xl sm:rounded-2xl p-1.5 sm:p-2 glow-purple transition-all duration-500 focus-within:glow-blue hover:scale-[1.01]">
            <div className="relative flex items-center">
              <Search className="absolute right-3 sm:right-4 h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث عن أداة ذكاء اصطناعي..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pr-10 sm:pr-14 py-4 sm:py-6 text-sm sm:text-base md:text-lg bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground/70 mt-3">
            +100 أداة ذكاء اصطناعي في تصنيفات: نصوص، صور، فيديو، برمجة، إنتاجية، دراسة وطلاب
          </p>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToTools}
          className="mx-auto mt-6 flex flex-col items-center gap-2 text-muted-foreground/50 hover:text-neon-purple transition-colors animate-bounce"
          aria-label="انتقل لقسم الأدوات"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
