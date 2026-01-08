import { useState } from 'react';
import { Plus, Activity, LogIn, LogOut, User, Menu, X, Settings, Shield, Heart, UserCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LanguageToggle from '@/components/LanguageToggle';
import NotificationsMenu from '@/components/NotificationsMenu';

interface NavbarProps {
  onAddClick?: () => void;
}

const Navbar = ({ onAddClick }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { toast } = useToast();
  const { t } = useTranslation();

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
              onClick={() => navigate('/')}
              className="hover:text-foreground transition-colors px-3 py-2"
            >
              {t('nav.home')}
            </button>
            <button
              onClick={() => {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('tools-heading')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hover:text-foreground transition-colors px-3 py-2"
            >
              {t('nav.tools')}
            </button>
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
              {t('nav.blog')}
            </button>

            <div className="h-6 w-px bg-border/50 mx-2" /> {/* Divider */}

            <LanguageToggle />
            <NotificationsMenu />

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
                {t('nav.login')}
              </Button>
            )}
          </div>

          {/* Mobile Menu using Sheet */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="فتح القائمة">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background/95 backdrop-blur-xl border-l border-border/50">
                <div className="flex flex-col gap-6 py-8">

                  {/* User Info in Mobile */}
                  {user && (
                    <div className="flex items-center gap-3 px-2 pb-4 border-b border-white/10">
                      <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple font-bold">
                        {user.email?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{user.user_metadata?.full_name || "مستخدم"}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={() => { setMobileMenuOpen(false); navigate('/'); }}
                      variant="ghost"
                      className="justify-start gap-3 text-lg"
                    >
                      <Activity className="w-5 h-5 text-neon-purple" />
                      {t('nav.home')}
                    </Button>

                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/');
                        setTimeout(() => {
                          document.getElementById('tools-heading')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                      variant="ghost"
                      className="justify-start gap-3 text-lg"
                    >
                      <Settings className="w-5 h-5" />
                      {t('nav.tools')}
                    </Button>

                    <Button
                      onClick={() => { setMobileMenuOpen(false); navigate('/blog'); }}
                      variant="ghost"
                      className="justify-start gap-3 text-lg"
                    >
                      <span className="text-xl">📰</span>
                      {t('nav.blog')}
                    </Button>

                    {user && (
                      <Button
                        onClick={() => { setMobileMenuOpen(false); navigate('/bookmarks'); }}
                        variant="ghost"
                        className="justify-start gap-3 text-lg"
                      >
                        <Heart className="w-5 h-5 text-rose-500" />
                        المفضلة
                      </Button>
                    )}
                  </div>

                  <div className="h-px bg-white/10 my-2" />

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-start px-2">
                      <LanguageToggle />
                    </div>

                    {onAddClick && (
                      <Button
                        onClick={handleAddClick}
                        className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity gap-2 py-6 text-base"
                      >
                        <Plus className="h-5 w-5" />
                        أضف أداة
                      </Button>
                    )}

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
                        {t('nav.login')}
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
