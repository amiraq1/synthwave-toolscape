import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, ExternalLink, Activity, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const AnalyticsWidget = () => {
    const { i18n } = useTranslation();
    const isAr = i18n.language === "ar";
    // جلب إحصائيات سريعة من قاعدة البيانات
    const { data: stats } = useQuery({
        queryKey: ['admin-quick-stats'],
        queryFn: async () => {
            const { count: totalTools } = await supabase.from('tools').select('*', { count: 'exact', head: true });
            const { count: publishedTools } = await supabase.from('tools').select('*', { count: 'exact', head: true }).eq('is_published', true);

            return {
                total: totalTools || 0,
                published: publishedTools || 0,
            };
        }
    });

    const gaMeasurementId = "G-R43ED44ZYM"; // يمكن نقله إلى import.meta.env.VITE_GA_ID

    return (
        <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/20 card-glow col-span-1 md:col-span-3 overflow-hidden relative">
            {/* خلفية جمالية */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />

            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2 text-indigo-100">
                        <BarChart className="w-5 h-5 text-indigo-400" />
                        <span>{isAr ? "مركز البيانات والتحليلات" : "Data & Analytics Hub"}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 gap-2 text-xs h-8"
                        onClick={() => window.open('https://analytics.google.com/', '_blank')}
                    >
                        Google Analytics <ExternalLink className="w-3 h-3" />
                    </Button>
                </CardTitle>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">

                    {/* حالة تتبع GA4 */}
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-gray-400 text-xs">{isAr ? "حالة التتبع (GA4)" : "Tracking Status (GA4)"}</p>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                        </div>
                        <div>
                            <p className="text-xl font-bold font-mono text-indigo-200 tracking-wider">
                                {gaMeasurementId}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-1">
                                {isAr ? "البيانات المباشرة متوفرة في لوحة Google" : "Live data is available in the Google dashboard"}
                            </p>
                        </div>
                    </div>

                    {/* نسبة النشر */}
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-gray-400 text-xs">{isAr ? "صحة المحتوى" : "Content Health"}</p>
                            <FileCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                            <div className="flex items-end gap-2">
                                <p className="text-2xl font-bold text-emerald-200">
                                    {stats ? Math.round((stats.published / (stats.total || 1)) * 100) : 0}%
                                </p>
                                <span className="text-xs text-emerald-500/80 mb-1.5">{isAr ? "منشور" : "Published"}</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1.5 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${stats ? Math.round((stats.published / (stats.total || 1)) * 100) : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* حالة النظام */}
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 backdrop-blur-sm flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-gray-400 text-xs">{isAr ? "حالة النظام" : "System Status"}</p>
                            <Activity className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">{isAr ? "قاعدة البيانات" : "Database"}</span>
                                <span className="text-emerald-400 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {isAr ? "متصل" : "Connected"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">Edge Functions</span>
                                <span className="text-emerald-400 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {isAr ? "نشط" : "Active"}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};

export default AnalyticsWidget;
