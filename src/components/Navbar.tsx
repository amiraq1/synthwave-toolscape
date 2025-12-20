import { useState } from 'react';
import { Plus, Activity, LogIn, LogOut, User, Menu, X, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  onAddClick: () => void;
}

const Navbar = ({ onAddClick }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    toast({
      title: 'تم تسجيل الخروج',
      description: 'نراك قريباً!',
    });
  };

  const handleAddClick = () => {
    setMobileMenuOpen(false);
    onAddClick();
  };

  const handleAuthClick = () => {
    setMobileMenuOpen(false);
    navigate('/auth');
  };

  const handleSettingsClick = () => {
    setMobileMenuOpen(false);
    navigate('/settings');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50" dir="rtl">
      <div className="container mx-auto max-w-7xl px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
          >
            <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-neon-purple animate-pulse" />
            <h1 className="text-xl sm:text-2xl">
              <span className="font-extrabold gradient-text">نبض</span>
              <span className="font-medium text-foreground/80 mr-1">AI</span>
            </h1>
          </button>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              onClick={onAddClick}
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity gap-2"
            >
              <Plus className="h-5 w-5" />
              أضف أداة
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 border-border/50"
                  >
                    <User className="h-4 w-4" />
                    <span className="max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 glass">
                  <DropdownMenuItem 
                    onClick={handleSettingsClick}
                    className="gap-2 cursor-pointer"
                  >
                    <Settings className="h-4 w-4" />
                    الإعدادات
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                className="gap-2 border-border/50"
              >
                <LogIn className="h-4 w-4" />
                دخول
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-2 touch-manipulation"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            mobileMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
          )}
        >
          <div className="flex flex-col gap-3 py-4 border-t border-border/50">
            {user && (
              <div className="flex items-center gap-2 text-muted-foreground px-1 py-2">
                <User className="h-4 w-4" />
                <span className="text-sm truncate">{user.email}</span>
              </div>
            )}
            
            <Button
              onClick={handleAddClick}
              className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity gap-2 py-6 text-base"
            >
              <Plus className="h-5 w-5" />
              أضف أداة
            </Button>

            {user ? (
              <>
                <Button
                  onClick={handleSettingsClick}
                  variant="outline"
                  className="w-full gap-2 border-border/50 py-6 text-base"
                >
                  <Settings className="h-5 w-5" />
                  الإعدادات
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full gap-2 border-destructive/50 text-destructive py-6 text-base"
                >
                  <LogOut className="h-5 w-5" />
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <Button
                onClick={handleAuthClick}
                variant="outline"
                className="w-full gap-2 border-border/50 py-6 text-base"
              >
                <LogIn className="h-5 w-5" />
                تسجيل الدخول
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
