import { useEffect, useState, useRef } from "react";
import { useCompare } from "@/context/CompareContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Check, ArrowRight, Plus, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { getToolImageUrl } from "@/utils/imageUrl";
import { translateFeature } from "@/utils/featureTranslations";
import type { Tool } from "@/hooks/useTools";
import { useTranslation } from "react-i18next";

const ComparePage = () => {
  const { selectedTools, removeFromCompare, setCompareList } = useCompare();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const hasSyncedFromUrl = useRef(false);
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  useEffect(() => {
    if (hasSyncedFromUrl.current) return;

    const idsParam = searchParams.get("ids");
    if (idsParam) {
      const ids = idsParam.split(",").filter((id) => id.length > 0);
      if (ids.length > 0) {
        const isSame = ids.length === selectedTools.length && ids.every((id) => selectedTools.includes(id));
        if (!isSame) setCompareList(ids);
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

      const numericIds = selectedTools.map((value) => Number(value)).filter((value) => Number.isFinite(value));
      if (numericIds.length === 0) {
        setTools([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data } = await supabase.from("tools").select("*").in("id", numericIds);
        if (data) setTools(data as unknown as Tool[]);
      } catch (error) {
        console.error("Error fetching tools:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchTools();
  }, [selectedTools]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a]" role="main" dir={isAr ? "rtl" : "ltr"}>
        <Loader2 className="w-10 h-10 animate-spin text-neon-purple" />
      </div>
    );

  if (tools.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f1a] p-4 text-center font-cairo" role="main" dir={isAr ? "rtl" : "ltr"}>
        <h1 className="text-3xl font-bold text-white mb-4">{isAr ? "لا توجد أدوات للمقارنة" : "No tools selected"}</h1>
        <p className="text-gray-400 mb-8 max-w-md">
          {isAr ? "أضف أدوات من الصفحة الرئيسية لبدء المقارنة." : "Add tools from the homepage to start comparing."}
        </p>
        <Link to="/">
          <Button className="bg-neon-purple hover:bg-neon-purple/80 px-8 py-6 text-lg rounded-xl">
            {isAr ? "تصفح الأدوات" : "Browse tools"}
            <ArrowRight className={`w-5 h-5 ${isAr ? "mr-2" : "ml-2 rotate-180"}`} />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] pt-24 pb-20 px-4 md:px-8 font-cairo" role="main" dir={isAr ? "rtl" : "ltr"}>
      <Helmet>
        <title>{isAr ? "مقارنة الأدوات | نبض AI" : "Tool Comparison | Nabd AI"}</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{isAr ? "مقارنة المواصفات ⚖️" : "Compare Specifications ⚖️"}</h1>
            <p className="text-gray-400">{isAr ? "قارن أدوات الذكاء الاصطناعي جنباً إلى جنب" : "Compare AI tools side by side"}</p>
          </div>
          {tools.length < 3 && (
            <Link to="/">
              <Button variant="outline" className="border-white/10 hover:bg-white/5 text-neon-purple border-neon-purple/20">
                <Plus className={`w-4 h-4 ${isAr ? "ml-2" : "mr-2"}`} /> {isAr ? `إضافة أداة (${tools.length}/3)` : `Add tool (${tools.length}/3)`}
              </Button>
            </Link>
          )}
        </div>

        <div className="overflow-x-auto pb-4 custom-scrollbar">
          <div className="min-w-[800px] bg-[#151525] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-[250px_repeat(auto-fit,minmax(280px,1fr))] border-b border-white/10">
              <div className="p-6 bg-white/[0.02] flex flex-col justify-center text-gray-300 font-bold border-l border-white/10">
                <span className="text-xl text-white">{isAr ? "الأدوات المختارة" : "Selected Tools"}</span>
                <span className="text-sm font-normal text-gray-500 mt-2">{isAr ? "يمكنك مقارنة حتى 3 أدوات" : "You can compare up to 3 tools"}</span>
              </div>
              {tools.map((tool) => (
                <div key={tool.id} className="relative p-6 flex flex-col items-center text-center border-l border-white/10 last:border-0 bg-white/[0.02]">
                  <button
                    onClick={() => removeFromCompare(String(tool.id))}
                    className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                    title={isAr ? "إزالة من المقارنة" : "Remove from compare"}
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="w-24 h-24 rounded-2xl overflow-hidden mb-4 border-2 border-white/10 shadow-lg group hover:border-neon-purple/50 transition-colors">
                    <ImageWithFallback src={getToolImageUrl(tool.image_url, tool.url)} alt={tool.title} className="w-full h-full object-cover" />
                  </div>

                  <h3 className="font-bold text-white text-xl mb-1 line-clamp-1" title={tool.title}>{tool.title}</h3>
                  <span className="text-xs text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 px-2.5 py-1 rounded-full">{tool.category}</span>

                  <div className="mt-6 flex gap-3 w-full">
                    <Link to={`/tool/${tool.id}`} className="flex-1">
                      <Button variant="secondary" className="w-full text-xs bg-white/5 hover:bg-white/10 text-white border border-white/10">{isAr ? "التفاصيل" : "Details"}</Button>
                    </Link>
                    <a href={tool.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button className="w-full text-xs bg-neon-purple hover:bg-neon-purple/80 text-white shadow-lg shadow-neon-purple/20">{isAr ? "زيارة الموقع" : "Visit site"}</Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[250px_repeat(auto-fit,minmax(280px,1fr))] border-b border-white/10 hover:bg-white/[0.01] transition-colors group">
              <div className="p-5 px-6 text-gray-300 font-medium border-l border-white/10 flex items-center bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors">
                ⭐ {isAr ? "التقييم والشعبية" : "Rating & Popularity"}
              </div>
              {tools.map((tool) => (
                <div key={tool.id} className="p-5 px-6 flex flex-col items-center justify-center border-l border-white/10 last:border-0 gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-bold text-yellow-500">{tool.average_rating || 0}</span>
                    <div className="text-xs text-gray-500 flex flex-col items-start leading-tight">
                      <span>{isAr ? "من 5.0" : "out of 5.0"}</span>
                      <span>{isAr ? `(${tool.reviews_count || 0} مراجعة)` : `(${tool.reviews_count || 0} reviews)`}</span>
                    </div>
                  </div>
                  <div className="w-full max-w-[150px] bg-white/5 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${((tool.average_rating || 0) / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[250px_repeat(auto-fit,minmax(280px,1fr))] border-b border-white/10 hover:bg-white/[0.01] transition-colors group">
              <div className="p-5 px-6 text-gray-300 font-medium border-l border-white/10 flex items-center bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors">
                💵 {isAr ? "التكلفة" : "Pricing"}
              </div>
              {tools.map((tool) => (
                <div key={tool.id} className="p-5 px-6 flex items-center justify-center border-l border-white/10 last:border-0">
                  <span
                    className={`px-4 py-2 rounded-xl text-sm font-bold border ${
                      tool.pricing_type === "Free"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : tool.pricing_type === "Freemium"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    }`}
                  >
                    {tool.pricing_type === "Free"
                      ? isAr
                        ? "مجاني بالكامل"
                        : "Free"
                      : tool.pricing_type === "Freemium"
                      ? isAr
                        ? "مجاني / مدفوع"
                        : "Freemium"
                      : isAr
                      ? "مدفوع"
                      : "Paid"}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[250px_repeat(auto-fit,minmax(280px,1fr))] border-b border-white/10 hover:bg-white/[0.01] transition-colors group">
              <div className="p-5 px-6 text-gray-300 font-medium border-l border-white/10 flex items-center bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors">
                🌐 {isAr ? "دعم اللغة العربية" : "Arabic Support"}
              </div>
              {tools.map((tool) => (
                <div key={tool.id} className="p-5 px-6 flex items-center justify-center border-l border-white/10 last:border-0">
                  {tool.supports_arabic ? (
                    <div className="flex items-center gap-2 text-green-400 bg-green-500/5 px-3 py-1.5 rounded-lg border border-green-500/10">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-bold">{isAr ? "يدعم العربية" : "Supported"}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5">
                      <X className="w-4 h-4" />
                      <span className="text-sm">{isAr ? "لا يدعم" : "Not supported"}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[250px_repeat(auto-fit,minmax(280px,1fr))] border-b border-white/10 hover:bg-white/[0.01] transition-colors group min-h-[200px]">
              <div className="p-5 px-6 text-gray-300 font-medium border-l border-white/10 flex items-start pt-8 bg-white/[0.02] group-hover:bg-white/[0.04] transition-colors">
                ✨ {isAr ? "أبرز المميزات" : "Top Features"}
              </div>
              {tools.map((tool) => (
                <div key={tool.id} className="p-6 border-l border-white/10 last:border-0">
                  <ul className="space-y-3">
                    {tool.features?.slice(0, 5).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <div className="mt-1 min-w-[16px] h-4 w-4 bg-neon-purple/20 text-neon-purple rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className="leading-relaxed">{translateFeature(feature)}</span>
                      </li>
                    ))}
                    {(!tool.features || tool.features.length === 0) && (
                      <li className="text-gray-600 text-sm italic">{isAr ? "لا توجد ميزات مدرجة" : "No listed features"}</li>
                    )}
                  </ul>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[250px_repeat(auto-fit,minmax(280px,1fr))]">
              <div className="p-5 px-6 text-gray-300 font-medium border-l border-white/10 flex items-center bg-white/[0.02]">
                📝 {isAr ? "نبذة مختصرة" : "Overview"}
              </div>
              {tools.map((tool) => (
                <div key={tool.id} className="p-6 text-sm text-gray-400 leading-7 text-center border-l border-white/10 last:border-0 flex items-center justify-center">
                  {tool.description}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
