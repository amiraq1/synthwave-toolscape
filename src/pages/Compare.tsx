import { useEffect, useState } from "react";
import { useCompare } from "@/context/CompareContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Check, X, Loader2, ExternalLink, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

const ComparePage = () => {
    const { selectedTools, removeFromCompare } = useCompare();
    const [tools, setTools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    useEffect(() => {
        const fetchData = async () => {
            if (selectedTools.length === 0) {
                setTools([]);
                setLoading(false);
                return;
            }

            const { data } = await supabase
                .from("tools")
                .select("*")
                .in("id", selectedTools);

            if (data) setTools(data);
            setLoading(false);
        };
        fetchData();
    }, [selectedTools]);

    if (loading) return (
        <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-neon-purple" />
        </div>
    );

    if (tools.length === 0) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4" dir={isAr ? "rtl" : "ltr"}>
            <Scale className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-white">
                {isAr ? "لم تختر أي أدوات للمقارنة" : "No tools selected for comparison"}
            </h2>
            <p className="text-gray-400 mb-6">
                {isAr
                    ? "اضغط على أيقونة الميزان ⚖️ في بطاقات الأدوات لإضافتها هنا."
                    : "Click the scale icon ⚖️ on tool cards to add them here."
                }
            </p>
            <Link to="/">
                <Button>{isAr ? "تصفح الأدوات" : "Browse Tools"}</Button>
            </Link>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-12 min-h-screen" dir={isAr ? "rtl" : "ltr"}>
            <h1 className="text-3xl font-bold mb-8 text-center flex items-center justify-center gap-3">
                <Scale className="text-neon-purple" />
                {isAr ? "مقارنة الأدوات" : "Compare Tools"}
            </h1>

            <div className="overflow-x-auto pb-10">
                <table className={`w-full min-w-[800px] border-collapse ${isAr ? 'text-right' : 'text-left'}`}>
                    <thead>
                        <tr>
                            <th className="p-4 w-1/4"></th>
                            {tools.map(tool => {
                                const displayTitle = isAr ? tool.title : (tool.title_en || tool.title);
                                return (
                                    <th key={tool.id} className="p-4 w-1/4 min-w-[220px] bg-white/5 border border-white/10 rounded-t-xl relative align-top">
                                        <button
                                            onClick={() => removeFromCompare(tool.id)}
                                            className="absolute top-2 left-2 text-gray-500 hover:text-red-500 p-1 bg-black/20 rounded-full"
                                            title={isAr ? "إزالة" : "Remove"}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>

                                        <div className="mt-4 text-center">
                                            <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden mb-3 border border-white/10">
                                                <ImageWithFallback
                                                    src={tool.image_url}
                                                    alt={displayTitle}
                                                    className="w-full h-full object-cover"
                                                    width={100}
                                                />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-1">{displayTitle}</h3>
                                            <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full">{tool.category}</span>
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {/* Pricing Type */}
                        <tr className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-4 font-bold text-white bg-white/5">
                                {isAr ? "نوع السعر" : "Pricing"}
                            </td>
                            {tools.map(tool => (
                                <td key={tool.id} className="p-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${tool.pricing_type === 'مجاني' ? 'bg-green-500/10 text-green-400' :
                                        tool.pricing_type === 'مدفوع' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
                                        }`}>
                                        {tool.pricing_type}
                                    </span>
                                </td>
                            ))}
                        </tr>

                        {/* Description */}
                        <tr className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-4 font-bold text-white bg-white/5 align-top">
                                {isAr ? "الوصف" : "Description"}
                            </td>
                            {tools.map(tool => {
                                const displayDescription = isAr ? tool.description : (tool.description_en || tool.description);
                                return (
                                    <td key={tool.id} className="p-4 text-sm leading-relaxed align-top">
                                        {displayDescription}
                                    </td>
                                );
                            })}
                        </tr>

                        {/* Features */}
                        <tr className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-4 font-bold text-white bg-white/5 align-top">
                                {isAr ? "المميزات" : "Features"}
                            </td>
                            {tools.map(tool => (
                                <td key={tool.id} className="p-4 align-top">
                                    <ul className="space-y-2 text-sm">
                                        {tool.features?.map((feat: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                            ))}
                        </tr>

                        {/* Actions */}
                        <tr>
                            <td className="p-4 bg-transparent"></td>
                            {tools.map(tool => (
                                <td key={tool.id} className="p-4 text-center">
                                    <Link to={`/tool/${tool.id}`}>
                                        <Button variant="outline" className="w-full mb-2 border-white/10 hover:bg-white/5">
                                            {isAr ? "التفاصيل" : "Details"}
                                        </Button>
                                    </Link>
                                    <a href={tool.url} target="_blank" rel="noreferrer">
                                        <Button className="w-full bg-neon-purple hover:bg-neon-purple/80">
                                            {isAr ? "زيارة الموقع" : "Visit Site"} <ExternalLink className="w-3 h-3 mr-2" />
                                        </Button>
                                    </a>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComparePage;
