import { useEffect, useState, useCallback, useRef } from "react";
import { useCompare } from "@/context/CompareContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X, Check, ArrowRight, Plus, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { useTranslation } from "react-i18next";
import type { Tool } from "@/hooks/useTools";

const ComparePage = () => {
    const { t, i18n } = useTranslation();
    const { selectedTools, removeFromCompare, setCompareList } = useCompare();
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    // Ref to track if we've synced URL params on mount
    const hasSyncedFromUrl = useRef(false);

    // 1. مزامنة الرابط مع السياق عند التحميل لأول مرة
    useEffect(() => {
        if (hasSyncedFromUrl.current) return;

        const idsParam = searchParams.get('ids');
        if (idsParam) {
            const ids = idsParam.split(',').filter(id => id.length > 0);
            if (ids.length > 0) {
                // تجنب التحديث إذا كانت القائمة هي نفسها بالفعل (لمنع حلقات لا نهائية)
                const isSame = ids.length === selectedTools.length && ids.every(id => selectedTools.includes(id));
                if (!isSame) {
                    setCompareList(ids);
                }
            }
        }
        hasSyncedFromUrl.current = true;
    }, [searchParams, selectedTools, setCompareList]);

    // 2. تحديث الرابط عند تغير الأدوات المحددة
    useEffect(() => {
        if (selectedTools.length > 0) {
            setSearchParams({ ids: selectedTools.join(',') }, { replace: true });
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
                // جلب بيانات الأدوات المحددة فقط
                // Convert string IDs to numbers for the query if they are stored as bigint/int in DB
                const numericIds = selectedTools.map(id => parseInt(id, 10)).filter(id => !isNaN(id));

                const { data } = await supabase
                    .from("tools")
                    .select("*")
                    .in("id", numericIds);

                if (data) {
                    // Map back to Tool interface with string IDs
                    const mappedTools = data.map(item => ({
                        ...item,
                        id: String(item.id)
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

    // تجميع كل الميزات الفريدة من جميع الأدوات لإنشاء جدول المقارنة
    const allFeatures = Array.from(new Set(tools.flatMap(t => t.features || [])));

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a]"><Loader2 className="w-10 h-10 animate-spin text-neon-purple" /></div>;

    if (tools.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f1a] p-4 text-center" dir={i18n.dir()}>
                <h1 className="text-3xl font-bold text-white mb-4">{t('compare.no_tools')}</h1>
                <p className="text-gray-400 mb-8 max-w-md">{t('compare.no_tools_desc')}</p>
                <Link to="/">
                    <Button className="bg-neon-purple hover:bg-neon-purple/80 px-8 py-6 text-lg rounded-xl gap-2">
                        {t('compare.browse')} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f0f1a] pt-24 pb-20 px-4 md:px-8 font-cairo" dir={i18n.dir()}>
            <Helmet>
                <title>{t('compare.meta_title')}</title>
            </Helmet>

            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-white">{t('compare.specs')}</h1>
                    <Link to="/">
                        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-gray-300 gap-2">
                            <Plus className="w-4 h-4" /> {t('compare.add_tool')}
                        </Button>
                    </Link>
                </div>

                {/* الحاوية القابلة للتمرير */}
                <div className="overflow-x-auto pb-4 custom-scrollbar">
                    <div className="min-w-[800px] bg-white/5 rounded-3xl border border-white/10 overflow-hidden">

                        {/* 1. الصف الرأسي (الهيدر) - الصور والأسماء */}
                        <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(250px,1fr))] border-b border-white/10 text-start">
                            <div className="p-6 bg-white/[0.02] flex items-center text-gray-400 font-bold border-e border-white/10">
                                {t('compare.criteria')}
                            </div>
                            {tools.map(tool => (
                                <div key={tool.id} className="relative p-6 flex flex-col items-center text-center border-l border-white/10 last:border-0 bg-white/[0.02]">
                                    <button
                                        onClick={() => removeFromCompare(tool.id)}
                                        className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                    <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-lg">
                                        <ImageWithFallback src={tool.image_url} alt={tool.title} width={100} />
                                    </div>

                                    <h3 className="font-bold text-white text-lg mb-1">{tool.title}</h3>
                                    <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">{tool.category}</span>

                                    <div className="mt-4 flex gap-2 w-full">
                                        <Link to={`/tool/${tool.id}`} className="flex-1">
                                            <Button size="sm" variant="outline" className="w-full text-xs border-white/10">{t('compare.details')}</Button>
                                        </Link>
                                        <a href={tool.url} target="_blank" className="flex-1">
                                            <Button size="sm" className="w-full text-xs bg-neon-purple hover:bg-neon-purple/80">{t('compare.visit')}</Button>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(250px,1fr))] border-b border-white/10 hover:bg-white/[0.02] transition-colors text-start">
                            <div className="p-4 px-6 text-gray-300 font-bold border-e border-white/10 flex items-center">
                                💵 {t('compare.cost')}
                            </div>
                            {tools.map(tool => (
                                <div key={tool.id} className="p-4 px-6 flex items-center justify-center border-e border-white/10 last:border-0">
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${tool.pricing_type === 'Free' ? 'bg-green-500/20 text-green-400' :
                                        tool.pricing_type === 'Freemium' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-orange-500/20 text-orange-400'
                                        }`}>
                                        {tool.pricing_type === 'Free' ? t('pricing.free') :
                                            tool.pricing_type === 'Freemium' ? t('pricing.freemium') : t('pricing.paid')}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* 3. صفوف المميزات (Dynamic Matrix) */}
                        {allFeatures.map((feature: string, idx) => (
                            <div key={idx} className="grid grid-cols-[200px_repeat(auto-fit,minmax(250px,1fr))] border-b border-white/10 hover:bg-white/[0.02] transition-colors text-start">
                                <div className="p-4 px-6 text-gray-400 text-sm border-e border-white/10 flex items-center">
                                    {feature}
                                </div>
                                {tools.map(tool => {
                                    const hasFeature = tool.features?.includes(feature);
                                    return (
                                        <div key={tool.id} className="p-4 flex items-center justify-center border-e border-white/10 last:border-0">
                                            {hasFeature ? (
                                                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                    <span className="text-gray-600 text-lg">-</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}

                        <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(250px,1fr))] text-start">
                            <div className="p-4 px-6 text-gray-300 font-bold border-e border-white/10 flex items-center">
                                📝 {t('compare.about')}
                            </div>
                            {tools.map(tool => (
                                <div key={tool.id} className="p-6 text-sm text-gray-400 leading-relaxed text-center border-e border-white/10 last:border-0">
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
