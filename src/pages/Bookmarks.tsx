import { Heart, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import ToolCard from "@/components/ToolCard";
import { useBookmarkedTools } from "@/hooks/useBookmarks";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { Tool } from "@/hooks/useTools";
import { useTranslation } from "react-i18next";
import { EditorialHero, EditorialPage, EditorialPanel } from "@/components/layout/EditorialPage";

const Bookmarks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { data: tools, isLoading, error } = useBookmarkedTools();

  if (!user) {
    return (
      <EditorialPage>
        <EditorialHero
          eyebrow={t("nav.favorites")}
          title={t("bookmarks.title")}
          description={t("bookmarks.login_required")}
          icon={<Heart className="h-7 w-7" />}
          actions={
            <Button onClick={() => navigate("/auth")} className="h-12 rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800">
              {t("auth.login")}
            </Button>
          }
          aside={
            <div className="space-y-5 text-white">
              <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">BOOKMARKS</span>
              <p className="text-sm leading-7 text-white/70">
                المكتبة الشخصية تظهر فقط بعد تسجيل الدخول حتى يمكن حفظ اختياراتك ومزامنتها مع الحساب.
              </p>
            </div>
          }
        />
      </EditorialPage>
    );
  }

  return (
    <EditorialPage>
      <EditorialHero
        eyebrow={t("nav.favorites")}
        title={t("bookmarks.title")}
        description={t("bookmarks.subtitle")}
        icon={<Heart className="h-7 w-7" />}
        aside={
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">LIBRARY</span>
            <p className="text-sm leading-7 text-white/70">
              هذه المساحة تجمع الأدوات التي اخترت الاحتفاظ بها للمراجعة أو المقارنة أو العودة إليها لاحقًا.
            </p>
          </div>
        }
      />

      <EditorialPanel>
        {isLoading && (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-slate-950" />
            <span className="text-sm text-slate-600">{t("bookmarks.loading")}</span>
          </div>
        )}

        {error && (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-red-100 p-4">
              <Heart className="h-8 w-8 text-red-600" />
            </div>
            <p className="mb-2 text-xl font-bold text-red-600">{t("bookmarks.error_title")}</p>
            <p className="text-slate-600">{t("bookmarks.error_desc")}</p>
          </div>
        )}

        {!isLoading && !error && (!tools || tools.length === 0) && (
          <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-slate-900/5">
              <Heart className="h-10 w-10 text-slate-400" />
            </div>
            <p className="font-editorial text-3xl font-semibold text-slate-950">{t("bookmarks.empty_title")}</p>
            <p className="mt-3 max-w-xs text-sm leading-7 text-slate-600">{t("bookmarks.empty_desc")}</p>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="mt-6 gap-2 rounded-full border-black/10 bg-white px-5 text-slate-950 hover:bg-white"
            >
              <Search className="h-4 w-4" />
              {t("bookmarks.explore")}
            </Button>
          </div>
        )}

        {!isLoading && !error && tools && tools.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {tools.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool as Tool} index={index} />
            ))}
          </div>
        )}
      </EditorialPanel>
    </EditorialPage>
  );
};

export default Bookmarks;
