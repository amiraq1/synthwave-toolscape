import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Menu, Home, Wrench, Info, HelpCircle,
  BookOpen, Globe, Plus, Heart,
  Bot, GitBranch, LogOut, User, LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  onAddClick: () => void;
}

const Navbar = ({ onAddClick }: NavbarProps) => {
  const { session, signOut } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // حالة القائمة الجانبية للموبايل

  // دالة مساعدة لتحديد الرابط النشط
  const isActive = (path: string) => location.pathname === path;

  // قائمة الروابط لتسهيل التكرار
  const navLinks = [
    { name: "الرئيسية", path: "/", icon: Home },
    { name: "الأدوات", path: "/tools", icon: Wrench },
    { name: "سوق الوكلاء", path: "/agents", icon: Bot },
    { name: "المصنع", path: "/workflow/new", icon: GitBranch, badge: "جديد" },
    { name: "المدونة", path: "/blog", icon: BookOpen },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-pro font-cairo transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* 1. الشعار (دائماً ظاهر) */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 animated-gradient rounded-xl flex items-center justify-center shadow-lg shadow-neon-purple/20 group-hover:shadow-neon-purple/40 transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <span className="text-xl font-bold text-white hidden sm:block group-hover:text-neon-purple transition-colors duration-300">نبض AI</span>
            </Link>
          </div>

          {/* 2. روابط سطح المكتب (مخفية في الموبايل) */}
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

          {/* 3. الإجراءات (يمين الشاشة) */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* زر إضافة أداة (يظهر كأيقونة في الموبايل) */}
            <Button
              size="sm"
              className="hidden sm:flex bg-neon-purple hover:bg-neon-purple/80 text-white border-0"
              onClick={onAddClick}
            >
              <Plus className="w-4 h-4 ml-2" /> أضف أداة
            </Button>

            {/* نسخة الموبايل (أيقونة فقط) */}
            <Button
              size="icon"
              variant="ghost"
              className="sm:hidden text-neon-purple"
              onClick={onAddClick}
              aria-label="أضف أداة"
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
            </Button>

            {/* الإشعارات والمفضلة واللغة (مخفية في الموبايل الصغير جداً) */}
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" aria-label="المفضلة">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white" aria-label="تغيير اللغة">
                <Globe className="w-5 h-5" />
              </Button>
            </div>

            {/* بروفايل المستخدم */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border border-white/10">
                      <AvatarImage
                        src={session.user.user_metadata.avatar_url}
                        loading="eager"
                        fetchPriority="high"
                      />
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
                      <p className="w-[200px] truncate text-xs text-gray-400">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10">
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" /> الملف الشخصي
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-white/10">
                    <Link to="/admin">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-neon-cyan" /> لوحة التحكم
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-white/10 text-red-400" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-300 hover:text-white hover:bg-white/10 gap-2">
                  <User className="w-4 h-4" />
                  تسجيل الدخول
                </Button>
              </Link>
            )}

            {/* 4. زر القائمة للموبايل (Hamburger) */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-white ml-1" aria-label="القائمة">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#1a1a2e] border-l border-white/10 text-white w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="sr-only">قائمة التنقل</SheetTitle>
                  <SheetDescription className="sr-only">روابط التنقل للوصول السريع للأدوات والصفحات</SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-6 mt-8">
                  {/* الشعار في القائمة */}
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <div className="w-8 h-8 bg-neon-purple rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">⚡</span>
                    </div>
                    <span className="font-bold text-xl">نبض AI</span>
                  </div>

                  {/* الروابط العمودية */}
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

                  {/* روابط إضافية للموبايل */}
                  <div className="flex flex-col gap-2">
                    <Link to="/about" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white flex items-center gap-3">
                      <Info className="w-5 h-5" /> حول الموقع
                    </Link>
                    <Link to="/faq" onClick={() => setIsOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white flex items-center gap-3">
                      <HelpCircle className="w-5 h-5" /> الأسئلة الشائعة
                    </Link>
                  </div>

                  {/* قسم المستخدم في قائمة الموبايل */}
                  {session && (
                    <div className="mt-auto pt-6 border-t border-white/10">
                      <div className="flex items-center gap-3 px-2 mb-4">
                        <Avatar className="h-10 w-10 border border-white/10">
                          <AvatarImage src={session.user.user_metadata.avatar_url} />
                          <AvatarFallback className="bg-neon-purple text-white">
                            {session.user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white max-w-[180px] truncate">
                            {session.user.user_metadata.full_name || "مستخدم"}
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
                          <User className="w-4 h-4" /> الملف الشخصي
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          className="px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-3 text-sm font-medium w-full text-right"
                        >
                          <LogOut className="w-4 h-4" /> تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  )}
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
