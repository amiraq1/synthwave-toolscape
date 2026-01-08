// ... imports
import { Search, Sparkles, ArrowDown, Zap, Users, Star, Loader2 } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching?: boolean;
}

const HeroSection = ({ searchQuery, onSearchChange, isSearching }: HeroSectionProps) => {
  // ... existing code ...

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled via controlled input, but preventing default avoids page reload
  };

  // ... existing code ...

  {/* Search Bar - Enhanced */ }
        <div className="relative max-w-2xl mx-auto mt-8 sm:mt-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="glass-card rounded-2xl p-2 glow-purple transition-all duration-500 focus-within:glow-blue hover:scale-[1.02]">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <Button 
                type="submit" 
                size="icon" 
                variant="ghost"
                className={`absolute ${document.dir === 'rtl' ? 'right-2' : 'left-2'} h-10 w-10 text-muted-foreground hover:bg-transparent hover:text-neon-purple transition-colors`}
                aria-label="ابحث الآن"
                disabled={isSearching}
              >
                 {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5 sm:h-6 sm:w-6" />}
              </Button>
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className={`w-full ${document.dir === 'rtl' ? 'pr-12 sm:pr-14' : 'pl-12 sm:pl-14'} py-5 sm:py-7 text-base sm:text-lg bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60`}
              />
            </form>
          </div>
          <p className="text-sm text-muted-foreground/60 mt-4">
            نصوص • صور • فيديو • برمجة • إنتاجية • دراسة
          </p>
        </div>          <p className="text-sm text-muted-foreground/60 mt-4">
            نصوص • صور • فيديو • برمجة • إنتاجية • دراسة
          </p>
        </div >

  {/* Scroll Indicator */ }
  < button
onClick = { scrollToTools }
className = "mx-auto mt-8 flex flex-col items-center gap-2 text-muted-foreground/40 hover:text-neon-purple transition-colors"
aria - label="انتقل لقسم الأدوات"
  >
  <ArrowDown className="h-6 w-6 animate-bounce" />
        </button >
      </div >
    </section >
  );
};

export default HeroSection;
