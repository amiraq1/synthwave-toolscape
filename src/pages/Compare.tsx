import { useEffect, useState } from "react";
import { useCompare } from "@/context/CompareContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Check, X, Loader2, Star, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import type { Tool } from "@/hooks/useTools";

const ComparePage = () => {
    useSEO({
        title: "مقارنة الأدوات",
        description: "قارن بين أدوات الذكاء الاصطناعي المختلفة واختر الأنسب لاحتياجاتك",
    });

    const { selectedTools, removeFromCompare, clearCompare } = useCompare();
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

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
                .in("id", selectedTools.map(id => parseInt(id, 10)));

            if (data) {
                // Transform data to match Tool interface
                const transformedData = data.map(item => ({
                    ...item,
                    id: String(item.id),
                })) as unknown as Tool[];
                setTools(transformedData);
            }
            setLoading(false);
        };
        fetchData();
    }, [selectedTools]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex justify-center items-center p-20">
                    <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
                </div>
            </div>
        );
    }

    if (tools.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                    <div className="text-6xl mb-4">⚖️</div>
                    <h2 className="text-2xl font-bold mb-4 text-white">لم تختر أي أدوات للمقارنة</h2>
                    <p className="text-gray-400 mb-6">اختر حتى 3 أدوات من الصفحة الرئيسية للمقارنة بينها</p>
                    <Link
                        to="/"
                        className="flex items-center gap-2 bg-neon-purple hover:bg-neon-purple/80 text-white px-6 py-3 rounded-full transition-colors"
                    >
                        <ArrowRight className="w-4 h-4" />
                        تصفح الأدوات
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                        مقارنة الأدوات ⚔️
                    </h1>
                    <p className="text-gray-400">
                        قارن بين {tools.length} أدوات لاختيار الأنسب لك
                    </p>
                    <button
                        onClick={clearCompare}
                        className="mt-4 text-sm text-gray-500 hover:text-red-400 underline transition-colors"
                    >
                        مسح المقارنة
                    </button>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto rounded-2xl border border-white/10">
                    <table className="w-full min-w-[600px] border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 w-1/4 bg-white/5 border-b border-white/10"></th>
                                {tools.map(tool => (
                                    <th
                                        key={tool.id}
                                        className="p-4 min-w-[200px] bg-white/5 border-b border-white/10 relative"
                                    >
                                        <button
                                            onClick={() => removeFromCompare(tool.id)}
                                            className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                            aria-label="إزالة من المقارنة"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <h3 className="text-xl font-bold text-neon-purple mb-2">{tool.title}</h3>
                                        <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-300">
                                            {tool.category}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">
                            {/* السعر */}
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4 font-bold text-white bg-white/5">💰 السعر</td>
                                {tools.map(tool => (
                                    <td key={tool.id} className="p-4 text-center">
                                        <span className={`font-semibold ${tool.pricing_type === 'مجاني' ? 'text-emerald-400' : 'text-amber-400'
                                            }`}>
                                            {tool.pricing_type}
                                        </span>
                                    </td>
                                ))}
                            </tr>

                            {/* التقييم */}
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4 font-bold text-white bg-white/5">⭐ التقييم</td>
                                {tools.map(tool => (
                                    <td key={tool.id} className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-1 text-yellow-400">
                                            <Star className="w-4 h-4 fill-yellow-400" />
                                            <span>{tool.average_rating?.toFixed(1) || '--'}/5</span>
                                            {tool.reviews_count && (
                                                <span className="text-gray-500 text-xs">({tool.reviews_count})</span>
                                            )}
                                        </div>
                                    </td>
                                ))}
                            </tr>

                            {/* دعم العربية */}
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4 font-bold text-white bg-white/5">🌍 دعم العربية</td>
                                {tools.map(tool => (
                                    <td key={tool.id} className="p-4 text-center">
                                        {tool.supports_arabic ? (
                                            <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                                        ) : (
                                            <X className="w-5 h-5 text-red-400 mx-auto" />
                                        )}
                                    </td>
                                ))}
                            </tr>

                            {/* المميزات */}
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4 font-bold text-white bg-white/5 align-top">✨ أهم المميزات</td>
                                {tools.map(tool => (
                                    <td key={tool.id} className="p-4 align-top">
                                        <ul className="space-y-2 text-sm text-right">
                                            {tool.features?.slice(0, 5).map((feat, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                                    <span>{feat}</span>
                                                </li>
                                            )) || (
                                                    <span className="text-gray-500">لا توجد مميزات</span>
                                                )}
                                        </ul>
                                    </td>
                                ))}
                            </tr>

                            {/* الوصف */}
                            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4 font-bold text-white bg-white/5 align-top">📝 الوصف</td>
                                {tools.map(tool => (
                                    <td key={tool.id} className="p-4 text-sm text-gray-400 align-top">
                                        {tool.description}
                                    </td>
                                ))}
                            </tr>

                            {/* زر التفاصيل */}
                            <tr>
                                <td className="p-4 bg-transparent"></td>
                                {tools.map(tool => (
                                    <td key={tool.id} className="p-4 text-center">
                                        <Link
                                            to={`/tool/${tool.id}`}
                                            className="block w-full py-3 bg-white/10 hover:bg-neon-purple rounded-xl transition-colors text-white text-sm font-medium"
                                        >
                                            عرض التفاصيل
                                        </Link>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ComparePage;
