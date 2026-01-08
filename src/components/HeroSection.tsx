import { Search, Sparkles, ArrowDown, Zap, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import TrendingTools from "@/components/TrendingTools";

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const HeroSection = ({ searchQuery, onSearchChange }: HeroSectionProps) => {
  const { t } = useTranslation();

  const scrollToTools = () => {
    const toolsSection = document.getElementById('tools-heading');
    toolsSection?.scrollIntoView({ behavior: 'smooth' });
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
          <Link to="/about">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 px-8 py-7 text-lg font-semibold border-white/20 hover:bg-white/5 hover:border-neon-purple/50 transition-all"
            >
              تعرف على نبض
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

        {/* Search Bar - Enhanced */}
        <div className="relative max-w-2xl mx-auto mt-8 sm:mt-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="glass-card rounded-2xl p-2 glow-purple transition-all duration-500 focus-within:glow-blue hover:scale-[1.02]">
            <div className="relative flex items-center">
              <Search className={`absolute ${document.dir === 'rtl' ? 'right-4 sm:right-5' : 'left-4 sm:left-5'} h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground`} />
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-full ${document.dir === 'rtl' ? 'pr-12 sm:pr-14' : 'pl-12 sm:pl-14'} py-5 sm:py-7 text-base sm:text-lg bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60`}
              />
            </div>
          </div>
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
