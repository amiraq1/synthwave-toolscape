import { useEffect, useRef, useState } from "react";
import { useCompare } from "@/context/CompareContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Check, Plus, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ToolLogo from "@/components/ToolLogo";
import { useTranslation } from "react-i18next";
import type { Tool } from "@/hooks/useTools";
import { getValidToolUrl } from "@synthwave/utils";
import { EditorialHero, EditorialPage, EditorialPanel } from "@/components/layout/EditorialPage";

const ComparePage = () => {
  const { t, i18n } = useTranslation();
  const { selectedTools, removeFromCompare, setCompareList } = useCompare();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const hasSyncedFromUrl = useRef(false);

  useEffect(() => {
    if (hasSyncedFromUrl.current) return;

    const idsParam = searchParams.get("ids");
    if (idsParam) {
      const ids = idsParam.split(",").filter((id) => id.length > 0);
      if (ids.length > 0) {
        const isSame = ids.length === selectedTools.length && ids.every((id) => selectedTools.includes(id));
        if (!isSame) {
          setCompareList(ids);
        }
      }
    }
    hasSyncedFromUrl.current = true;
  }, [searchParams, selectedTools, setCompareList]);

  useEffect(() => {
    if (selectedTools.length > 0) {
      setSearchParams({ ids: selectedTools.join(",") }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [selectedTools, setSearchParams]);

  useEffect(() => {
    const fetchTools = async () => {
      if (selectedTools.length === 0) {
        setTools([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const numericIds = selectedTools.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));

        const { data } = await supabase
          .from("tools")
          .select("*")
          .in("id", numericIds);

        if (data) {
          const mappedTools = data.map((item) => ({
            ...item,
            id: String(item.id),
          })) as Tool[];
          setTools(mappedTools);
        }
      } catch (error) {
        console.error("Error fetching tools:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [selectedTools]);

  const allFeatures = Array.from(new Set(tools.flatMap((tool) => tool.features || [])));

  if (loading) {
    return (
      <EditorialPage>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-slate-950" />
        </div>
      </EditorialPage>
    );
  }

  if (tools.length === 0) {
    return (
      <EditorialPage>
        <EditorialHero
          eyebrow={t("compare.title")}
          title={t("compare.no_tools")}
          description={t("compare.no_tools_desc")}
          actions={
            <Link to="/">
              <Button className="h-12 rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800">
                {t("compare.browse")}
              </Button>
            </Link>
          }
        />
      </EditorialPage>
    );
  }

  return (
    <EditorialPage>
      <Helmet>
        <title>{t("compare.meta_title")}</title>
      </Helmet>

      <EditorialHero
        eyebrow={t("compare.title")}
        title={t("compare.specs")}
        description={t("compare.no_tools_desc")}
        actions={
          <Link to="/">
            <Button variant="outline" className="h-12 rounded-full border-black/10 bg-white/70 px-6 text-slate-950 hover:bg-white">
              <Plus className="ms-2 h-4 w-4" />
              {t("compare.add_tool")}
            </Button>
          </Link>
        }
        aside={
          <div className="space-y-5 text-white">
            <span className="editorial-kicker border-white/10 bg-white/10 text-white/65">COMPARE</span>
            <p className="text-sm leading-7 text-white/70">
              مساحة مقارنة مركّزة تسمح برؤية الفروق الأساسية بين الأدوات بدون تشتيت. كل بطاقة هنا قابلة للإزالة أو الفتح مباشرة.
            </p>
          </div>
        }
      />

      <EditorialPanel className="overflow-hidden p-0">
        <div className="overflow-x-auto pb-2 custom-scrollbar">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(250px,1fr))] border-b border-black/8">
              <div className="flex items-center border-e border-black/8 bg-black/5 p-6 text-sm font-semibold text-slate-500">
                {t("compare.criteria")}
              </div>

              {tools.map((tool) => {
                const toolWebsiteUrl = getValidToolUrl(tool.url);

                return (
                  <div key={tool.id} className="relative border-s border-black/8 p-6 text-center">
                    <button
                      onClick={() => removeFromCompare(tool.id)}
                      className="absolute left-4 top-4 rounded-full bg-black/5 p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <ToolLogo
                      title={tool.title}
                      imageUrl={tool.image_url}
                      category={tool.category}
                      toolUrl={tool.url}
                      size="xl"
                      className="mx-auto mb-4"
                    />

                    <h3 className="font-editorial text-2xl font-semibold text-slate-950">{tool.title}</h3>
                    <span className="mt-2 inline-flex rounded-full border border-black/8 bg-black/5 px-3 py-1 text-xs text-slate-600">
                      {tool.category}
                    </span>

                    <div className="mt-5 flex gap-2">
                      <Link to={`/tool/${tool.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full rounded-full border-black/10 bg-white text-slate-950 hover:bg-white">
                          {t("compare.details")}
                        </Button>
                      </Link>
                      {toolWebsiteUrl ? (
                        <a href={toolWebsiteUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button size="sm" className="w-full rounded-full bg-slate-950 text-white hover:bg-slate-800">
                            {t("compare.visit")}
                          </Button>
                        </a>
                      ) : (
                        <Button size="sm" variant="secondary" disabled className="flex-1 rounded-full">
                          {t("compare.visit_unavailable")}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(250px,1fr))] border-b border-black/8">
              <div className="flex items-center border-e border-black/8 bg-[#f7f1e5] p-5 text-sm font-semibold text-slate-700">
                💵 {t("compare.cost")}
              </div>
              {tools.map((tool) => (
                <div key={tool.id} className="flex items-center justify-center border-e border-black/8 p-5">
                  <span className="rounded-full bg-black/5 px-4 py-1.5 text-sm font-semibold text-slate-700">
                    {tool.pricing_type === "Free" ? t("pricing.free") :
                      tool.pricing_type === "Freemium" ? t("pricing.freemium") : t("pricing.paid")}
                  </span>
                </div>
              ))}
            </div>

            {allFeatures.map((feature, idx) => (
              <div key={idx} className="grid grid-cols-[220px_repeat(auto-fit,minmax(250px,1fr))] border-b border-black/8">
                <div className="flex items-center border-e border-black/8 bg-black/[0.03] p-5 text-sm text-slate-600">
                  {feature}
                </div>
                {tools.map((tool) => {
                  const hasFeature = tool.features?.includes(feature);

                  return (
                    <div key={tool.id} className="flex items-center justify-center border-e border-black/8 p-5">
                      {hasFeature ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <Check className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-slate-400">
                          -
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(250px,1fr))]">
              <div className="flex items-center border-e border-black/8 bg-[#f7f1e5] p-5 text-sm font-semibold text-slate-700">
                📝 {t("compare.about")}
              </div>
              {tools.map((tool) => (
                <div key={tool.id} className="border-e border-black/8 p-6 text-sm leading-7 text-slate-600">
                  {tool.description}
                </div>
              ))}
            </div>
          </div>
        </div>
      </EditorialPanel>
    </EditorialPage>
  );
};

export default ComparePage;
