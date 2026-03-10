import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Menu, Home, Wrench, Info, HelpCircle,
  BookOpen, Globe, Plus, Heart,
  Bot, Crown, GitBranch, LogOut, User
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useOwnerCheck } from "@/hooks/useOwnerCheck";

interface NavbarProps {
  onAddClick: () => void;
}

const Navbar = ({ onAddClick }: NavbarProps) => {
  const { session, signOut } = useAuth();
  const { isOwner } = useOwnerCheck();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: t("nav.home"), path: "/", icon: Home },
    { name: t("nav.tools"), path: "/tools", icon: Wrench },
    { name: t("nav.agents"), path: "/agents", icon: Bot },
    { name: t("nav.workflow"), path: "/workflow/new", icon: GitBranch, badge: t("nav.badge_new") },
    { name: t("nav.blog"), path: "/blog", icon: BookOpen },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav
      className="fixed top-0 z-50 w-full border-b border-black/5 bg-[#f7f2e8]/88 font-cairo text-slate-900 shadow-[0_12px_38px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300"
      dir={i18n.dir()}
    >
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)] transition-all duration-300 group-hover:-translate-y-0.5">
                <span className="font-bold text-lg">⚡</span>
              </div>
              <span className="hidden text-xl font-bold text-slate-950 transition-colors duration-300 group-hover:text-teal-800 sm:block">
                {t("brand.name")} AI
              </span>
            </Link>
          </div>

          <div className="mx-4 hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-950"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
                {link.badge && (
                  <span className="rounded-full border border-teal-700/20 bg-teal-700/10 px-1.5 py-0.5 text-[10px] text-teal-800">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              size="sm"
              className="hidden rounded-full border-0 bg-slate-950 px-4 text-white hover:bg-slate-800 sm:flex"
              onClick={onAddClick}
            >
              <Plus className="ms-2 h-4 w-4" /> {t("nav.add_tool")}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="text-slate-700 hover:bg-slate-900/5 sm:hidden"
              onClick={onAddClick}
              aria-label={t("nav.add_tool")}
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
            </Button>

            <div className="hidden items-center gap-2 sm:flex">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-500 hover:bg-slate-900/5 hover:text-slate-950"
                aria-label={t("nav.favorites")}
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-500 hover:bg-slate-900/5 hover:text-slate-950"
                aria-label={t("nav.language")}
              >
                <Globe className="h-5 w-5" />
              </Button>
            </div>

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full" aria-label={t("nav.profile")}>
                    <Avatar className="h-9 w-9 border border-black/10">
                      <AvatarImage
                        src={session.user.user_metadata.avatar_url}
                        loading="eager"
                        alt={session.user.user_metadata.full_name || t("nav.profile")}
                      />
                      <AvatarFallback className="bg-slate-950 text-white">
                        {session.user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 border-black/10 bg-[#f8f4eb] text-slate-950 shadow-[0_20px_48px_rgba(15,23,42,0.12)]"
                  align="end"
                >
                  <div className="mb-2 flex items-center justify-start gap-2 border-b border-black/8 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="max-w-[150px] truncate text-sm font-medium text-slate-950">
                        {session.user.user_metadata.full_name || session.user.email}
                      </p>
                      <p className="w-[200px] truncate text-xs text-slate-500">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  {isOwner && (
                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-900/5">
                      <Link to="/owner">
                        <Crown className="me-2 h-4 w-4" /> {t("nav.owner_dashboard")}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-900/5">
                    <Link to="/profile">
                      <User className="me-2 h-4 w-4" /> {t("nav.profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="me-2 h-4 w-4" /> {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" aria-label={t("nav.signin")}>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 rounded-full border-black/10 bg-white/70 text-slate-950 hover:bg-white"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("nav.signin")}</span>
                </Button>
              </Link>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ms-1 text-slate-900 hover:bg-slate-900/5 lg:hidden"
                  aria-label={t("nav.menu")}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] border-s border-black/8 bg-[#f5f0e6] text-slate-950 sm:w-[400px]"
                aria-describedby={undefined}
              >
                <SheetTitle className="sr-only">{t("nav.menu_title")}</SheetTitle>
                <SheetDescription className="sr-only">{t("nav.menu_desc")}</SheetDescription>

                <div className="mt-8 flex flex-col gap-6">
                  <div className="mb-4 flex items-center gap-2 px-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950">
                      <span className="font-bold text-white">⚡</span>
                    </div>
                    <span className="text-xl font-bold">{t("brand.name")} AI</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium transition-all ${
                          isActive(link.path)
                            ? "bg-slate-950 text-white"
                            : "text-slate-600 hover:bg-white/80 hover:text-slate-950"
                        }`}
                      >
                        <link.icon className="h-5 w-5" />
                        {link.name}
                        {link.badge && (
                          <span className="ms-auto rounded-full border border-teal-700/20 bg-teal-700/10 px-2 py-0.5 text-xs text-teal-800">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>

                  <div className="my-2 h-px bg-black/8" />

                  <div className="flex flex-col gap-2">
                    <Link
                      to="/about"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-slate-950"
                    >
                      <Info className="h-5 w-5" /> {t("nav.about")}
                    </Link>
                    <Link
                      to="/faq"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:text-slate-950"
                    >
                      <HelpCircle className="h-5 w-5" /> {t("nav.faq")}
                    </Link>
                  </div>

                  {session && (
                    <div className="mt-auto border-t border-black/8 pt-6">
                      <div className="mb-4 flex items-center gap-3 px-2">
                        <Avatar className="h-10 w-10 border border-black/10">
                          <AvatarImage src={session.user.user_metadata.avatar_url} />
                          <AvatarFallback className="bg-slate-950 text-white">
                            {session.user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="max-w-[180px] truncate text-sm font-bold text-slate-950">
                            {session.user.user_metadata.full_name || t("nav.user_default")}
                          </span>
                          <span className="max-w-[180px] truncate text-xs text-slate-500">
                            {session.user.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {isOwner && (
                          <Link
                            to="/owner"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 rounded-xl bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-white"
                          >
                            <Crown className="h-4 w-4" /> {t("nav.owner_dashboard")}
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 rounded-xl bg-white/70 px-4 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-white"
                        >
                          <User className="h-4 w-4" /> {t("nav.profile")}
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsOpen(false);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-start text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" /> {t("nav.logout")}
                        </button>
                      </div>
                    </div>
                  )}
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
