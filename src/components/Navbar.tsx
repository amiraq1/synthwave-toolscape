import { useState } from 'react';
import { Plus, Activity, LogIn, LogOut, User, Menu, X, Settings, Shield, Heart, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdminCheck';
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
  onAddClick?: () => void;
}

const Navbar = ({ onAddClick }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
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
    onAddClick?.();
  };

  const handleAuthClick = () => {
    setMobileMenuOpen(false);
    navigate('/auth');
  };

  const handleSettingsClick = () => {
    setMobileMenuOpen(false);
    navigate('/settings');
  };

  const handleAdminClick = () => {
    setMobileMenuOpen(false);
    navigate('/admin');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50 font-['Cairo']" dir="rtl">
      <div className="container mx-auto max-w-7xl px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity min-w-[44px] min-h-[44px]"
          >
            <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-neon-purple animate-pulse" />
            <div className="flex items-center gap-2 font-extrabold text-xl tracking-wide" aria-label="نبض AI - الصفحة الرئيسية">
              <span className="text-neon-purple">نبض</span> AI
            </div>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-300">
            {/* Navigation Links */}
            <button
              onClick={() => navigate('/about')}
              className="hover:text-foreground transition-colors px-3 py-2"
            >
              حول
            </button>
            <button
              onClick={() => navigate('/faq')}
              className="hover:text-foreground transition-colors px-3 py-2"
            >
              الأسئلة الشائعة
            </button>
            <button
              onClick={() => navigate('/blog')}
              className="hover:text-foreground transition-colors px-3 py-2"
            >
              المدونة
            </button>

            {/* Bookmarks - only for logged in users */}
            {user && (
              <button
                onClick={() => navigate('/bookmarks')}
                className="hover:text-rose-500 transition-colors px-3 py-2 flex items-center gap-1"
              >
                <Heart className="w-4 h-4" />
                المفضلة
              </button>
            )}

            {onAddClick && (
              <Button
                onClick={onAddClick}
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity gap-2"
              >
                <Plus className="h-5 w-5" />
                أضف أداة
              </Button>
            )}

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="rounded-full p-2 hover:bg-white/5 transition-colors"
                >
                  <UserCircle className="w-8 h-8 text-gray-300 hover:text-neon-purple" />
                </button>

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
                    {isAdmin && (
                      <>
                        <DropdownMenuItem
                          onClick={handleAdminClick}
                          className="gap-2 cursor-pointer text-neon-purple"
                        >
                          <Shield className="h-4 w-4" />
                          لوحة التحكم
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="gap-2 cursor-pointer"
                    >
                      <UserCircle className="h-4 w-4" />
                      الملف الشخصي
                    </DropdownMenuItem>
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
              </div>
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
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation rounded-lg hover:bg-muted/50 transition-colors"
            aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={mobileMenuOpen}
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

            {onAddClick && (
              <Button
                onClick={handleAddClick}
                className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity gap-2 py-6 text-base"
              >
                <Plus className="h-5 w-5" />
                أضف أداة
              </Button>
            )}

            <Button
              onClick={() => { setMobileMenuOpen(false); navigate('/blog'); }}
              variant="outline"
              className="w-full gap-2 border-border/50 py-6 text-base"
            >
              المدونة
            </Button>

            {user ? (
              <>
                {isAdmin && (
                  <Button
                    onClick={handleAdminClick}
                    variant="outline"
                    className="w-full gap-2 border-neon-purple/50 text-neon-purple py-6 text-base"
                  >
                    <Shield className="h-5 w-5" />
                    لوحة التحكم
                  </Button>
                )}
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
