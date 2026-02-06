import { useRef, useEffect } from 'react';
import { ArrowRight, Sparkles, Command, Cpu, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchAutocomplete from "@/components/SearchAutocomplete";

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching?: boolean;
}

const HeroSection = ({ searchQuery, onSearchChange, isSearching: _isSearching }: HeroSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;

      containerRef.current.style.setProperty('--mouse-x', `${x}`);
      containerRef.current.style.setProperty('--mouse-y', `${y}`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden px-4 md:px-6 pt-20 pb-32 w-full"
      style={{
        '--mouse-x': '0.5',
        '--mouse-y': '0.5',
      } as React.CSSProperties}
    >
      {/* 
        =============================================
        DYNAMIC ATMOSPHERE LAYER 
        ============================================= 
      */}
      <div className="absolute inset-0 bg-[#0f0f1a] -z-20" />

      {/* Dynamic Grid */}
      <div
        className="absolute inset-0 -z-10 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(124, 58, 237, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(124, 58, 237, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
        }}
      />

      {/* Aurora Borealis Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[50vh] bg-gradient-to-b from-neon-purple/20 via-transparent to-transparent blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-neon-blue/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen animate-pulse-slow" />

      {/* 
        =============================================
        CONTENT CORE 
        ============================================= 
      */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center space-y-12">

        {/* Badge: System Status */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md animate-fade-in">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-sm font-cairo font-bold text-slate-200 tracking-normal flex gap-2 items-center">
            المساعد الذكي v4.0: <span className="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">متصل</span>
          </span>
        </div>

        {/* Typography: The Statement */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-tight text-center">
            THE{' '}
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-violet-500 animate-pulse-slow">
                PULSE
              </span>
              {/* تأثير توهج خلف النص */}
              <div className="absolute inset-0 bg-neon-purple/20 blur-xl -z-10 animate-pulse"></div>
            </span>{' '}
            OF AI
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
            محرك البحث العربي الأول لأدوات الذكاء الاصطناعي.
            <span className="block mt-2 text-slate-500 text-lg">اكتشف، قارن، وابنِ المستقبل.</span>
          </p>
        </div>

        {/* Input: The Command Center */}
        <div className="w-full max-w-2xl relative group transform transition-all duration-500 hover:scale-[1.01]">
          {/* Glow Effect behind input */}
          <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-purple rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500 animate-gradient-x" />

          <div className="relative bg-[#0f0f1a]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-2 flex items-center shadow-2xl">
            <div className="pl-4 pr-3 text-slate-400">
              <Command className="w-6 h-6" />
            </div>

            <SearchAutocomplete
              value={searchQuery}
              onChange={onSearchChange}
              onSearch={onSearchChange}
              className="flex-1 bg-transparent border-none shadow-none text-lg text-white placeholder:text-slate-500 focus:ring-0 px-0 py-4 h-auto"
              inputClassName="bg-transparent border-none focus:ring-0 text-xl font-medium placeholder:text-slate-500 h-12"
              placeholder="ابحث عن أداة (مثلاً: ChatGPT, كتابة محتوى...)"
            />

            <Button
              size="icon"
              className="h-12 w-12 rounded-xl bg-neon-purple hover:bg-neon-purple/90 text-white shadow-lg shadow-neon-purple/20 transition-all hover:scale-105"
            >
              <ArrowRight className="w-6 h-6 rotate-180" />
            </Button>
          </div>

          {/* Quick Tags underneath */}
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm text-slate-500 font-mono">
            <span className="hover:text-neon-purple cursor-pointer transition-colors">#Coding</span>
            <span className="text-slate-700">•</span>
            <span className="hover:text-neon-purple cursor-pointer transition-colors">#Design</span>
            <span className="text-slate-700">•</span>
            <span className="hover:text-neon-purple cursor-pointer transition-colors">#Productivity</span>
          </div>
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 pt-12 border-t border-white/5 w-full max-w-3xl">
          {/* Stat 1 */}
          <div className="flex flex-col items-center space-y-2 group cursor-default transition-transform hover:-translate-y-1 duration-300">
            <Cpu className="w-6 h-6 text-slate-500 group-hover:text-neon-purple transition-colors" />
            <span className="text-3xl font-black text-white font-mono tracking-tighter">+500</span>
            <span className="text-sm text-slate-400 font-cairo font-medium">أداة ذكية</span>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center space-y-2 group cursor-default transition-transform hover:-translate-y-1 duration-300">
            <Globe className="w-6 h-6 text-slate-500 group-hover:text-neon-cyan transition-colors" />
            <span className="text-3xl font-black text-white font-mono tracking-tighter">AR/EN</span>
            <span className="text-sm text-slate-400 font-cairo font-medium">دعم ثنائي اللغة</span>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center space-y-2 group cursor-default transition-transform hover:-translate-y-1 duration-300">
            <Zap className="w-6 h-6 text-slate-500 group-hover:text-yellow-400 transition-colors" />
            <span className="text-3xl font-black text-white font-cairo tracking-tight">سريع</span>
            <span className="text-sm text-slate-400 font-cairo font-medium">أداء فوري</span>
          </div>

          {/* Stat 4 */}
          <div className="flex flex-col items-center space-y-2 group cursor-default transition-transform hover:-translate-y-1 duration-300">
            <Sparkles className="w-6 h-6 text-slate-500 group-hover:text-pink-400 transition-colors" />
            <span className="text-3xl font-black text-white font-cairo tracking-tight">مجاني</span>
            <span className="text-sm text-slate-400 font-cairo font-medium">وصول كامل</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
