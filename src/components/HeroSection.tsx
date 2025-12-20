import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const HeroSection = ({ searchQuery, onSearchChange }: HeroSectionProps) => {
  return (
    <section className="relative py-20 px-4 text-center overflow-hidden" dir="rtl">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
          <span className="gradient-text">اكتشف أدوات المستقبل</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          دليلك الشامل لأفضل أدوات الذكاء الاصطناعي التي ستغير طريقة عملك وإبداعك
        </p>
        
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mt-10">
          <div className="glass rounded-2xl p-2 glow-purple transition-all duration-300 focus-within:glow-blue">
            <div className="relative flex items-center">
              <Search className="absolute right-4 h-6 w-6 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث عن أداة ذكاء اصطناعي..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pr-14 py-6 text-lg bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
