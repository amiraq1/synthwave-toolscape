import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  onAddClick: () => void;
}

const Navbar = ({ onAddClick }: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50" dir="rtl">
      <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <h1 className="text-xl font-bold gradient-text">دليل أدوات الذكاء الاصطناعي</h1>
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
