import { Plus, Activity, LogIn, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface NavbarProps {
  onAddClick: () => void;
}

const Navbar = ({ onAddClick }: NavbarProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'تم تسجيل الخروج',
      description: 'نراك قريباً!',
    });
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50" dir="rtl">
      <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Activity className="h-8 w-8 text-neon-purple animate-pulse" />
          <h1 className="text-2xl">
            <span className="font-extrabold gradient-text">نبض</span>
            <span className="font-medium text-foreground/80 mr-1">AI</span>
          </h1>
        </button>
        
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-sm">{user.email}</span>
            </div>
          )}
          
          <Button
            onClick={onAddClick}
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity gap-2"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">أضف أداة</span>
          </Button>

          {user ? (
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="gap-2 border-border/50"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">خروج</span>
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/auth')}
              variant="outline"
              className="gap-2 border-border/50"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">دخول</span>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
