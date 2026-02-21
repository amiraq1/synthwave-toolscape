import { useRef, useEffect } from 'react';
import { ArrowLeft, Sparkles, Command, Cpu, Globe, Zap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchAutocomplete from "@/components/SearchAutocomplete";
import { useToolsStats } from '@/hooks/useToolsCount';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching?: boolean;
}

const HeroSection = ({ searchQuery, onSearchChange, isSearching: _isSearching }: HeroSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const { data: stats } = useToolsStats();

  const formatCount = (n: number) => {
    if (n >= 1000) return `+${Math.floor(n / 100) * 100}`;
    if (n >= 100) return `+${Math.floor(n / 10) * 10}`;
    return `${n}`;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (prefersReducedMotion || !hasFinePointer) {
      return;
    }

    let animationFrame = 0;

    const handlePointerMove = (e: PointerEvent) => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        // Mouse coordinates relative to section
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        container.style.setProperty('--mouse-x', `${x}px`);
        container.style.setProperty('--mouse-y', `${y}px`);

        // Spot light for the input box
        if (inputContainerRef.current) {
          const inputRect = inputContainerRef.current.getBoundingClientRect();
          const inputX = e.clientX - inputRect.left;
          const inputY = e.clientY - inputRect.top;
          inputContainerRef.current.style.setProperty('--spotlight-x', `${inputX}px`);
          inputContainerRef.current.style.setProperty('--spotlight-y', `${inputY}px`);
        }
      });
    };

    container.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      container.removeEventListener('pointermove', handlePointerMove);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 md:px-6 pt-16 pb-24 w-full"
    >
      {/* 
        =============================================
        DYNAMIC ATMOSPHERE LAYER 
        ============================================= 
      */}
      <div className="absolute inset-0 bg-[#07070a] -z-20" /> {/* Darker Void Base */}

      {/* Grid Floor */}
      <div
        className="absolute inset-0 -z-10 opacity-20 perspective-[800px]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(139, 92, 246, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(139, 92, 246, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '3rem 3rem',
          maskImage: 'linear-gradient(to bottom, transparent 20%, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 20%, black 80%, transparent 100%)',
          transform: 'rotateX(60deg) scale(1.5) translateY(-50%)',
          transformOrigin: 'top center'
        }}
      />

      {/* Dynamic Cursor Light (Follows Mouse) */}
      <div
        className="absolute pointer-events-none rounded-full blur-[100px] w-96 h-96 -z-10 bg-neon-purple/20 transition-opacity duration-500 opacity-0 group-hover:opacity-100 hidden md:block"
        style={{
          transform: 'translate(calc(var(--mouse-x, 0px) - 50%), calc(var(--mouse-y, 0px) - 50%))'
        }}
      />

      {/* Static Ambient Blooms */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-gradient-to-b from-neon-purple/10 via-neon-blue/5 to-transparent blur-[120px] pointer-events-none mix-blend-screen" />

      {/* 
        =============================================
        CONTENT CORE 
        ============================================= 
      */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center space-y-12 animate-fade-in fade-in slide-in-from-bottom-5">

        {/* System Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          </span>
          <span className="text-xs font-semibold text-slate-300 tracking-wider flex gap-1.5 items-center uppercase">
            محرك نبض:{" "}
            <span className="text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">نشط</span>
          </span>
        </div>

        {/* Typography: The Statement */}
        <div className="space-y-6 max-w-4xl mx-auto z-10">
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight mb-2 leading-[1.1]">
            <span className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              منصة{' '}
            </span>
            <span className="relative inline-block px-1 overflow-visible">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-violet-300 to-neon-cyan drop-shadow-[0_0_15px_rgba(188,19,254,0.4)]">
                الذكاء
              </span>
            </span>{' '}
            <span className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              الاصطناعي
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed px-4 text-balance">
            محرك البحث والمقارنة الأكثر تقدماً للمطورين وصناع المحتوى.
            <span className="block mt-2 text-slate-500 font-normal">
              اكتشف، قارن، وابنِ المستقبل فوراً.
            </span>
          </p>
        </div>

        {/* HUD Command Center (Input) */}
        <div
          ref={inputContainerRef}
          className="w-full max-w-2xl relative group transform transition-all duration-500 z-20"
        >
          {/* External Massive Glow (Activates on hover/focus) */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-purple rounded-3xl blur-xl opacity-20 group-hover:opacity-40 group-focus-within:opacity-60 transition duration-700 animate-gradient-x -z-10" />

          {/* Core HUD Container */}
          <div className="relative bg-[#050508]/90 backdrop-blur-2xl rounded-2xl border border-white/10 p-1.5 flex items-center shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden group-focus-within:border-neon-purple/50 transition-colors">

            {/* Interactive Spotlight internal gradient */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:block"
              style={{
                background: 'radial-gradient(circle 200px at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(255,255,255,0.06), transparent)'
              }}
            />

            <div className="hidden sm:flex pl-5 pr-2 pt-1 text-slate-500 items-center h-full">
              <Search className="w-5 h-5 group-focus-within:text-neon-purple transition-colors drop-shadow-md" />
            </div>

            <div className="flex-1 px-1 relative z-10 w-full">
              <SearchAutocomplete
                value={searchQuery}
                onChange={onSearchChange}
                onSearch={onSearchChange}
                className="w-full bg-transparent border-none shadow-none text-white focus:ring-0 p-0 m-0"
                inputClassName="w-full bg-transparent border-none focus:ring-0 text-base sm:text-[1.1rem] font-medium placeholder:text-slate-600 h-14 p-0 shadow-none ring-0 outline-none"
                placeholder="ابحث عن أي أداة ذكاء اصطناعي..."
              />
            </div>

            {/* Action Button */}
            <Button
              type="button"
              onClick={() => onSearchChange(searchQuery.trim())}
              className="relative h-[56px] px-6 sm:px-8 rounded-xl bg-neon-purple hover:bg-white text-white hover:text-black shadow-[0_0_20px_rgba(188,19,254,0.3)] transition-all duration-300 font-bold overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2 tracking-widest text-sm uppercase">
                بحث
                <ArrowLeft className="w-4 h-4" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] hover:translate-x-[200%] transition-transform duration-1000 ease-out" />
            </Button>
          </div>

          {/* Cybernetic Tags */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3 text-xs uppercase tracking-wider font-bold">
            {['#برمجة', '#محتوى', '#صور', '#فيديو', '#صوت'].map((tag) => (
              <span key={tag} className="text-slate-500 hover:text-neon-cyan cursor-pointer transition-colors px-2 py-1 rounded bg-white/5 border border-white/5 hover:border-neon-cyan/30 hover:bg-neon-cyan/5">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* HUD Status Bar (Bottom Stats) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl pt-8 relative z-10">
          {[
            { icon: Cpu, val: stats ? formatCount(stats.total_tools) : '—', lbl: "أداة ذكية", col: "group-hover:text-neon-purple", glow: "group-hover:shadow-[0_0_20px_rgba(188,19,254,0.2)]" },
            { icon: Globe, val: "AR", lbl: "دعم عربي حصري", col: "group-hover:text-neon-cyan", glow: "group-hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]" },
            { icon: Sparkles, val: stats?.free_tools ? formatCount(stats.free_tools) : '—', lbl: "مجانية", col: "group-hover:text-amber-400", glow: "group-hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]" },
            { icon: Zap, val: "فائق", lbl: "سرعة الاستجابة", col: "group-hover:text-rose-400", glow: "group-hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]" },
          ].map((stat, i) => (
            <div key={i} className={cn("flex flex-col items-center justify-center space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md transition-all duration-300 hover:bg-white/[0.04] hover:-translate-y-1 group", stat.glow)}>
              <stat.icon className={cn("w-5 h-5 text-slate-500 transition-colors", stat.col)} />
              <span className="text-2xl font-black text-white font-mono tracking-tighter tabular-nums drop-shadow-md">
                {stat.val}
              </span>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{stat.lbl}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
