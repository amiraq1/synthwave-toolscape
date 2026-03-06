import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Menu,
  Plus,
  Search,
  User,
  LogOut,
  LayoutDashboard,
  Home,
  Wrench,
  Bot,
  GitBranch,
  BookOpen,
  Heart,
  Info,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getValidImageUrl } from "@/utils/imageUrl";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onAddClick: () => void;
}

const Navbar = ({ onAddClick }: NavbarProps) => {
  const { session, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userAvatarUrl = getValidImageUrl(session?.user?.user_metadata?.avatar_url) || undefined;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: "الرئيسية", path: "/", icon: Home },
    { name: "الأدوات", path: "/tools", icon: Wrench },
    { name: "الوكلاء", path: "/agents", icon: Bot },
    { name: "بناء وكيل", path: "/workflow/new", icon: GitBranch, badge: "جديد" },
    { name: "المدونة", path: "/blog", icon: BookOpen },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 font-body transition-all duration-500 isolate",
      scrolled 
        ? "bg-[#0b0b14]/90 backdrop-blur-2xl border-b border-white/10 py-0 shadow-2xl shadow-black/40" 
        : "bg-transparent py-2"
    )} dir="rtl">
      <div className={cn(
        "absolute inset-x-0 bottom-0 h-px transition-opacity duration-500",
        scrolled ? "opacity-100 bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent" : "opacity-0"
      )} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2.5 group active:scale-95 transition-transform">
            <div className="w-10 h-10 animated-gradient rounded-xl flex items-center justify-center shadow-lg shadow-neon-purple/20 group-hover:rotate-6 transition-transform duration-500">
              <span className="text-white font-black text-xl tracking-tighter">ن</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-black text-xl tracking-wide bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent group-hover:to-white transition-all duration-500">نبض</span>
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-neon-cyan/80 group-hover:text-neon-cyan transition-colors">AI</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/5 p-1 rounded-2xl backdrop-blur-md">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 group",
                  isActive(link.path)
                    ? "text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive(link.path) && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-neon-purple/20 border border-neon-purple/30 rounded-xl -z-10 shadow-[0_0_15px_rgba(188,19,254,0.15)]"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <link.icon className={cn("w-4 h-4 transition-colors", isActive(link.path) ? "text-neon-purple" : "group-hover:text-neon-purple")} />
                {link.name}
                {link.badge && (
                  <span className="text-[10px] bg-neon-purple text-white px-1.5 py-0.5 rounded-md font-black shadow-lg shadow-neon-purple/20">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="default"
              size="sm"
              className="hidden sm:flex bg-neon-purple hover:bg-neon-purple/80 text-white border-0"
              onClick={onAddClick}
            >
              <Plus className="w-4 h-4 ml-2" /> إضافة أداة
            </Button>

            <Button
              variant="ghost"
              className="sm:hidden text-neon-purple"
              onClick={onAddClick}
              aria-label="إضافة أداة"
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
            </Button>

            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" aria-label="البحث">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" aria-label="المحفوظات">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full" aria-label="قائمة الحساب">
                    <Avatar className="h-9 w-9 border border-white/10">
                      <AvatarImage
                        src={userAvatarUrl}
                        alt={session.user.user_metadata.full_name || session.user.email}
                      />
                      <AvatarFallback className="bg-neon-purple text-white font-bold">
                        {session.user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#1a1a2e] border-white/10 text-white shadow-2xl" align="end" sideOffset={8} dir="rtl">
                  <div className="flex items-center justify-start gap-2 p-2 border-b border-white/10 mb-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm text-white truncate max-w-[150px]">
                        {session.user.user_metadata.full_name || session.user.email}
                      </p>
                      <p className="w-[200px] truncate text-xs text-gray-400">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10 flex items-center gap-2" dir="rtl">
                    <Link to="/profile">
                      <User className="h-4 w-4" /> حسابي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10 flex items-center gap-2" dir="rtl">
                    <Link to="/admin">
                      <LayoutDashboard className="h-4 w-4 text-neon-cyan" /> لوحة التحكم
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-white/10 text-red-400 flex items-center gap-2" onClick={handleLogout} dir="rtl">
                    <LogOut className="h-4 w-4" /> تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10 gap-2" aria-label="تسجيل الدخول">
                  <User className="w-4 h-4" />
                  <span className="hidden xs:inline">تسجيل الدخول</span>
                </Button>
              </Link>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-white mr-1" aria-label="القائمة">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#1a1a2e] border-r border-white/10 text-white w-[300px] sm:w-[400px]" dir="rtl">
                <SheetHeader>
                  <SheetTitle className="sr-only">قائمة التنقل</SheetTitle>
                  <SheetDescription className="sr-only">روابط سريعة لأهم الأقسام</SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-6 mt-8 h-full">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-8 h-8 bg-neon-purple rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">ن</span>
                    </div>
                    <span className="font-bold text-xl">نبض AI</span>
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
                          <span className="mr-auto bg-neon-purple/20 text-neon-purple text-xs px-2 py-0.5 rounded-full border border-neon-purple/30">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>

                  <div className="h-px bg-white/10 my-2" />

                  <div className="flex flex-col gap-2">
                    <Link to="/about" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white flex items-center gap-3">
                      <Info className="w-5 h-5" /> من نحن
                    </Link>
                    <Link to="/faq" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white flex items-center gap-3">
                      <HelpCircle className="w-5 h-5" /> الأسئلة الشائعة
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
                              {session.user.user_metadata.full_name || "المستخدم"}
                            </span>
                            <span className="text-xs text-gray-400 max-w-[180px] truncate">
                              {session.user.email}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Link
                            to="/profile"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2.5 rounded-lg bg-white/5 text-white hover:bg-neon-purple hover:text-white transition-colors flex items-center gap-3 text-sm font-medium"
                          >
                            <User className="w-4 h-4" /> حسابي
                          </Link>
                          <Link
                            to="/admin"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2.5 rounded-lg bg-white/5 text-neon-cyan hover:bg-neon-cyan hover:text-black transition-colors flex items-center gap-3 text-sm font-medium"
                          >
                            <LayoutDashboard className="w-4 h-4" /> لوحة التحكم
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsOpen(false);
                            }}
                            className="px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 text-sm font-medium w-full text-left"
                          >
                            <LogOut className="w-4 h-4" /> تسجيل الخروج
                          </button>
                        </div>
                      </>
                    ) : (
                      <Link
                        to="/auth"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-3 rounded-xl bg-neon-purple text-white text-center font-bold shadow-lg shadow-neon-purple/20 flex items-center justify-center gap-2"
                      >
                        <User className="w-5 h-5" /> تسجيل الدخول
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

          </div>
        </div >
      </div >
    </nav >
  );
};

export default Navbar;
