
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, ExternalLink, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";

const AnalyticsWidget = () => {
    // جلب أكثر الأدوات نقراً (آخر 7 أيام مثلاً - يحتاج لتعديل RPC أو جلب خام)
    // حالياً سنفترض وجود دالة أو نجلب من جدول النقرات مباشرة إذا مسموح
    // للتبسيط، سنعرض رابط GA وبطاقة معلومات عامة

    return (
        <Card className="bg-gradient-to-br from-indigo-900/10 to-purple-900/10 border-indigo-500/20 card-glow col-span-1 md:col-span-3">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-indigo-400" />
                        <span>تحليلات الزوار (Analytics)</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 gap-2"
                        onClick={() => window.open('https://analytics.google.com/', '_blank')}
                    >
                        فتح لوحة Google Analytics <ExternalLink className="w-4 h-4" />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                        <p className="text-gray-400 text-xs mb-1">حالة التتبع</p>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-bold text-emerald-400">نشط (Google Analytics 4)</span>
                        </div>
                    </div>

                    <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                        <p className="text-gray-400 text-xs mb-1">إعدادات GA4</p>
                        <p className="font-mono text-xs text-white/70 truncate" title="G-R43ED44ZYM">ID: G-R43ED44ZYM</p>
                    </div>

                    <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                        <p className="text-gray-400 text-xs mb-1">البيانات الحية</p>
                        <p className="text-xs text-indigo-300">
                            يمكنك مشاهدة المستخدمين المتواجدين حالياً عبر لوحة Google Analytics "Realtime".
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AnalyticsWidget;
