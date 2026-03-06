import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Compass, Search } from "lucide-react";
import {
  EditorialHero,
  EditorialPage,
  EditorialPanel,
} from "@/components/layout/EditorialPage";

const NotFound = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname,
      );
    }
  }, [location.pathname]);

  return (
    <EditorialPage dir={i18n.dir()}>
      <EditorialHero
        eyebrow="404"
        title={t("notfound.title")}
        description={t("notfound.description")}
        icon={<Compass className="h-7 w-7" />}
        aside={
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">
              Missing Route
            </span>
            <h2 className="font-editorial text-6xl font-semibold leading-none">
              404
            </h2>
            <p className="text-sm leading-7 text-white/72">
              {location.pathname}
            </p>
          </div>
        }
      />

      <EditorialPanel className="max-w-4xl">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-950">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Search className="h-5 w-5" />
              </div>
              <h2 className="font-editorial text-2xl font-semibold">
                {t("notfound.title")}
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              {t("notfound.description")}
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t("notfound.back")}
          </Link>
        </div>
      </EditorialPanel>
    </EditorialPage>
  );
};

export default NotFound;
