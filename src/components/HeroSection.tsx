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
      {/* Enhanced background effects with GPU acceleration */}
      <div className="absolute top-10 left-1/4 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-neon-purple/25 rounded-full blur-[120px] sm:blur-[150px] -z-10 gpu-accelerated animate-float" />
      <div className="absolute bottom-10 right-1/4 w-72 sm:w-[500px] h-72 sm:h-[500px] bg-neon-blue/20 rounded-full blur-[120px] sm:blur-[150px] -z-10 gpu-accelerated" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[180px] -z-10 gpu-accelerated" />

      {/* Animated Grid pattern */}
      <div className="absolute inset-0 opacity-[0.12] -z-10" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(139,92,246,0.3) 1px, transparent 0)",
        backgroundSize: "40px 40px"
      }} />

      {/* Pure CSS Background - Optimized for performance */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none gpu-accelerated">
        {/* Deep space gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a]" />

        {/* Subtle Neon Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(124,58,237,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(124,58,237,0.08)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />

        {/* Top Glow Effect - Animated */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-neon-purple/15 blur-[100px] rounded-full opacity-60 mix-blend-screen animate-pulse-slow" />

        {/* Bottom Accent Glow */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-neon-blue/10 blur-[80px] rounded-full opacity-40" />

        {/* Additional cyan accent */}
        <div className="absolute top-1/3 left-0 w-[300px] h-[300px] bg-neon-cyan/5 blur-[100px] rounded-full opacity-50" />
      </div>

      {/* Trending Bar */}
      <div className="max-w-7xl mx-auto mb-12">
        <TrendingTools />
      </div>

      <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
        {/* Premium Animated Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-neon-purple/10 border border-neon-purple/40 text-sm text-neon-purple animate-fade-in backdrop-blur-sm shadow-lg shadow-neon-purple/10 hover:shadow-neon-purple/20 hover:border-neon-purple/60 transition-all duration-300 pulse-ring">
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="font-medium">أكبر دليل عربي لأدوات الذكاء الاصطناعي</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
          </span>
        </div>

        {/* Main headline with animated gradient */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <span className="text-white">{t('hero.title')}</span>
        </h1>

        {/* Subheadline with better styling */}
        <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground/90 max-w-3xl mx-auto leading-relaxed font-medium animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {t('hero.subtitle')}
        </p>

        {/* Premium CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 pt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button
            onClick={scrollToTools}
            size="lg"
            className="btn-premium animated-gradient text-white gap-2 px-8 py-7 text-lg font-bold shadow-xl shadow-neon-purple/30 hover:shadow-2xl hover:shadow-neon-purple/40 transition-all duration-300 border-0 rounded-2xl"
          >
            <Sparkles className="h-5 w-5" />
            استكشف الأدوات
          </Button>
          <Link to="/workflow/new">
            <Button
              size="lg"
              variant="outline"
              className="btn-premium gap-2 px-8 py-7 text-lg font-bold rounded-2xl border-2 border-neon-purple/50 text-white hover:bg-neon-purple/15 hover:border-neon-purple transition-all duration-300 group backdrop-blur-sm"
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
