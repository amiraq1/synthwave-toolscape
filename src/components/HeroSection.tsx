import { Search, Sparkles, ArrowDown, Zap, Users, Star, Loader2, GitBranch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import TrendingTools from "@/components/TrendingTools";
import SearchAutocomplete from "@/components/SearchAutocomplete";

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching?: boolean;
}

const HeroSection = ({ searchQuery, onSearchChange, isSearching }: HeroSectionProps) => {
  const { t } = useTranslation();

  const scrollToTools = () => {
    const toolsSection = document.getElementById('tools-heading');
    toolsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className="relative py-16 sm:py-20 md:py-28 px-4 text-center overflow-hidden">
      {/* Enhanced background effects */}
      <div className="absolute top-10 left-1/4 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-neon-purple/25 rounded-full blur-[120px] sm:blur-[180px] -z-10" />
      <div className="absolute bottom-10 right-1/4 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-neon-blue/20 rounded-full blur-[120px] sm:blur-[180px] -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[200px] -z-10" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.15] -z-10" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)",
        backgroundSize: "32px 32px"
      }} />

      {/* Hero Image - Preloaded for performance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none -z-20 mix-blend-overlay">
        <img
          src="/robot-placeholder.jpg"
          alt="AI Background"
          className="w-full h-full object-cover rounded-full blur-3xl animate-pulse-slow"
          loading="eager"
          // @ts-ignore - fetchPriority is a valid attribute but React types might not know it yet
          fetchPriority="high"
        />
      </div>

      {/* Trending Bar */}
      <div className="max-w-7xl mx-auto mb-12">
        <TrendingTools />
      </div>

      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-sm text-neon-purple animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>أكبر دليل عربي لأدوات الذكاء الاصطناعي</span>
        </div>

        {/* Main headline with better typography */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {t('hero.title')}
        </h1>

        {/* Subheadline */}
        <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {t('hero.subtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button
            onClick={scrollToTools}
            size="lg"
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 text-white gap-2 px-8 py-7 text-lg font-semibold shadow-lg shadow-neon-purple/25 hover:shadow-xl hover:shadow-neon-purple/30 transition-all"
          >
            <Sparkles className="h-5 w-5" />
            استكشف الأدوات
          </Button>
          <Link to="/workflow/new">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 px-8 py-7 text-lg font-semibold rounded-full border-neon-purple/50 text-white hover:bg-neon-purple/10 hover:border-neon-purple transition-all group"
            >
              <GitBranch className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              جرب صانع الوكلاء
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 pt-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Zap className="h-5 w-5 text-neon-purple" />
            <span className="text-sm sm:text-base">+100 أداة</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5 text-neon-blue" />
            <span className="text-sm sm:text-base">+1000 مستخدم</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="h-5 w-5 text-neon-cyan" />
            <span className="text-sm sm:text-base">تحديث يومي</span>
          </div>
        </div>

        <div className="relative max-w-2xl mx-auto mt-8 sm:mt-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <SearchAutocomplete
            value={searchQuery}
            onChange={onSearchChange}
            onSearch={onSearchChange}
            className="glass-card rounded-2xl p-2 glow-purple transition-all duration-500 hover:scale-[1.02] z-20"
            inputClassName="bg-transparent border-none focus:ring-0 focus:bg-transparent shadow-none text-base sm:text-lg py-4 sm:py-6"
          />
          <p className="text-sm text-muted-foreground/60 mt-4">
            نصوص • صور • فيديو • برمجة • إنتاجية • دراسة
          </p>
        </div>

        {/* Scroll Indicator */}
        <button
          onClick={scrollToTools}
          className="mx-auto mt-8 flex flex-col items-center gap-2 text-muted-foreground/40 hover:text-neon-purple transition-colors"
          aria-label="انتقل لقسم الأدوات"
        >
          <ArrowDown className="h-6 w-6 animate-bounce" />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
