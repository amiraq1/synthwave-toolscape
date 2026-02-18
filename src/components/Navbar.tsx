import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Menu, Home, Wrench, Info, HelpCircle,
  BookOpen, Globe, Plus, Heart, Search,
  Bot, GitBranch, LogOut, User, LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getValidImageUrl } from "@/utils/imageUrl";

interface NavbarProps {
  onAddClick: () => void;
}

const Navbar = ({ onAddClick }: NavbarProps) => {
  const { session, signOut } = useAuth();
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const userAvatarUrl = getValidImageUrl(session?.user?.user_metadata?.avatar_url) || undefined;

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: isAr ? "الرئيسية" : "Home", path: "/", icon: Home },
    { name: isAr ? "الأدوات" : "Tools", path: "/tools", icon: Wrench },
    { name: isAr ? "سوق الوكلاء" : "Agents", path: "/agents", icon: Bot },
    { name: isAr ? "المصنع" : "Builder", path: "/workflow/new", icon: GitBranch, badge: isAr ? "جديد" : "New" },
    { name: isAr ? "المدونة" : "Blog", path: "/blog", icon: BookOpen },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  useEffect(() => {
    document.dir = isAr ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isAr]);

  const toggleLanguage = () => {
    const newLang = isAr ? "en" : "ar";
    void i18n.changeLanguage(newLang);
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-pro font-cairo transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 animated-gradient rounded-xl flex items-center justify-center shadow-lg shadow-neon-purple/20 group-hover:shadow-neon-purple/40 transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <span className="text-xl font-bold text-white hidden sm:block group-hover:text-neon-purple transition-colors duration-300">{isAr ? "نبض AI" : "Nabd AI"}</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-1 mx-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isActive(link.path)
                    ? "text-white bg-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
                {link.badge && (
                  <span className="bg-neon-purple/20 text-neon-purple text-[10px] px-1.5 py-0.5 rounded border border-neon-purple/30 animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              size="sm"
              className="hidden sm:flex bg-neon-purple hover:bg-neon-purple/80 text-white border-0"
              onClick={onAddClick}
            >
              <Plus className={`w-4 h-4 ${isAr ? 'ml-2' : 'mr-2'}`} /> {isAr ? "أضف أداة" : "Add Tool"}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="sm:hidden text-neon-purple"
              onClick={onAddClick}
              aria-label={isAr ? "أضف أداة" : "Add tool"}
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
            </Button>

            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" aria-label={isAr ? "بحث في الموقع" : "Search"}>
                <Search className="w-5 h-5" />
              </Button>
              <Link to="/bookmarks">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" aria-label={isAr ? "المفضلة" : "Bookmarks"}>
                  <Heart className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                aria-label={isAr ? "تغيير اللغة" : "Change language"}
                onClick={toggleLanguage}
              >
                <Globe className="w-5 h-5" />
              </Button>
            </div>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full" aria-label={isAr ? "قائمة الحساب" : "Account menu"}>
                    <Avatar className="h-9 w-9 border border-white/10">
                      <AvatarImage src={userAvatarUrl} loading="eager" fetchPriority="high" />
                      <AvatarFallback className="bg-neon-purple text-white">
                        {session.user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#1a1a2e] border-white/10 text-white" align="end">
                  <div className="flex items-center justify-start gap-2 p-2 border-b border-white/10 mb-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm text-white truncate max-w-[150px]">
                        {session.user.user_metadata.full_name || session.user.email}
                      </p>
                      <p className="w-[200px] truncate text-xs text-gray-400">{session.user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10">
                    <Link to="/profile">
                      <User className={`${isAr ? 'ml-2' : 'mr-2'} h-4 w-4`} /> {isAr ? "الملف الشخصي" : "Profile"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10">
                    <Link to="/admin">
                      <LayoutDashboard className={`${isAr ? 'ml-2' : 'mr-2'} h-4 w-4 text-neon-cyan`} /> {isAr ? "لوحة التحكم" : "Dashboard"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-white/10 text-red-400" onClick={handleLogout}>
                    <LogOut className={`${isAr ? 'ml-2' : 'mr-2'} h-4 w-4`} /> {isAr ? "تسجيل الخروج" : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 gap-2" aria-label={isAr ? "تسجيل الدخول" : "Login"}>
                  <User className="w-4 h-4" />
                  <span className="hidden xs:inline">{isAr ? "تسجيل الدخول" : "Login"}</span>
                </Button>
              </Link>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-white ml-1" aria-label={isAr ? "القائمة" : "Menu"}>
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isAr ? "right" : "left"} className="bg-[#1a1a2e] border-l border-white/10 text-white w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="sr-only">{isAr ? "قائمة التنقل" : "Navigation"}</SheetTitle>
                  <SheetDescription className="sr-only">{isAr ? "روابط التنقل" : "Navigation links"}</SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-6 mt-8 h-full">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-8 h-8 bg-neon-purple rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">⚡</span>
                    </div>
                    <span className="font-bold text-xl">{isAr ? "نبض AI" : "Nabd AI"}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`px-4 py-3 rounded-xl text-base font-medium transition-all flex items-center gap-3 ${isActive(link.path)
                            ? "bg-neon-purple text-white shadow-lg shadow-neon-purple/20"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                          }`}
                      >
                        <link.icon className="w-5 h-5" />
                        {link.name}
                        {link.badge && (
                          <span className="mr-auto bg-neon-purple/20 text-neon-purple text-xs px-2 py-0.5 rounded-full border border-neon-purple/30">{link.badge}</span>
                        )}
                      </Link>
                    ))}
                  </div>

                  <div className="h-px bg-white/10 my-2" />

                  <div className="flex flex-col gap-2">
                    <Link to="/about" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white flex items-center gap-3">
                      <Info className="w-5 h-5" /> {isAr ? "حول الموقع" : "About"}
                    </Link>
                    <Link to="/faq" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white flex items-center gap-3">
                      <HelpCircle className="w-5 h-5" /> {isAr ? "الأسئلة الشائعة" : "FAQ"}
                    </Link>
                  </div>

                  <div className="mt-auto pb-10 pt-6 border-t border-white/10">
                    {session ? (
                      <>
                        <div className="flex items-center gap-3 px-2 mb-4">
                          <Avatar className="h-10 w-10 border border-white/10">
                            <AvatarImage src={userAvatarUrl} />
                            <AvatarFallback className="bg-neon-purple text-white">
                              {session.user.email?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white max-w-[180px] truncate">
                              {session.user.user_metadata.full_name || (isAr ? "مستخدم" : "User")}
                            </span>
                            <span className="text-xs text-gray-400 max-w-[180px] truncate">{session.user.email}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Link to="/profile" onClick={() => setIsOpen(false)} className="px-4 py-2.5 rounded-lg bg-white/5 text-white hover:bg-neon-purple hover:text-white transition-colors flex items-center gap-3 text-sm font-medium">
                            <User className="w-4 h-4" /> {isAr ? "الملف الشخصي" : "Profile"}
                          </Link>
                          <Link to="/admin" onClick={() => setIsOpen(false)} className="px-4 py-2.5 rounded-lg bg-white/5 text-neon-cyan hover:bg-neon-cyan hover:text-black transition-colors flex items-center gap-3 text-sm font-medium">
                            <LayoutDashboard className="w-4 h-4" /> {isAr ? "لوحة التحكم" : "Dashboard"}
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsOpen(false);
                            }}
                            className={`px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 text-sm font-medium w-full ${isAr ? 'text-right' : 'text-left'}`}
                          >
                            <LogOut className="w-4 h-4" /> {isAr ? "تسجيل الخروج" : "Logout"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <Link to="/auth" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-xl bg-neon-purple text-white text-center font-bold shadow-lg shadow-neon-purple/20 flex items-center justify-center gap-2">
                        <User className="w-5 h-5" /> {isAr ? "تسجيل الدخول" : "Login"}
                      </Link>
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
