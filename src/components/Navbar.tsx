import { Plus, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  onAddClick: () => void;
}

const Navbar = ({ onAddClick }: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50" dir="rtl">
      <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-neon-purple animate-pulse" />
          <h1 className="text-2xl">
            <span className="font-extrabold gradient-text">نبض</span>
            <span className="font-medium text-foreground/80 mr-1">AI</span>
          </h1>
        </div>
        
        <Button
          onClick={onAddClick}
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity gap-2"
        >
          <Plus className="h-5 w-5" />
          أضف أداة
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
