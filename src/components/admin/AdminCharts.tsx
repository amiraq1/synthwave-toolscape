import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';

// تعريف واجهة البيانات
interface Tool {
    category: string;
    created_at?: string;
}

interface AdminChartsProps {
    tools: Tool[];
}

// ألوان المخطط الدائري
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a0c4ff', '#bdb2ff'];

const AdminCharts = ({ tools }: AdminChartsProps) => {

    // 1. معالجة بيانات توزيع التصنيفات (Pie Chart)
    // نأخذ أعلى 8 تصنيفات لعدم ازدحام الرسم
    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        tools.forEach(tool => {
            // إذا لم يوجد تصنيف، نضعه تحت "Other"
            const cat = tool.category || 'Other';
            counts[cat] = (counts[cat] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value) // الترتيب من الأكثر للأقل
            .slice(0, 8); // الاكتفاء بأعلى 8
    }, [tools]);

    // 2. معالجة بيانات النمو الشهري (Bar Chart) - آخر 6 أشهر
    const growthData = useMemo(() => {
        const months: Record<string, number> = {};
        const today = new Date();

        // تهيئة الأشهر الستة الماضية بالقيمة 0 لضمان ظهورها حتى لو لم تكن هناك بيانات
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            // استخدام اسم الشهر بالإنجليزي للمطابقة مع البيانات، ويمكن تعريبه في العرض
            const key = d.toLocaleString('en-US', { month: 'short' });
            months[key] = 0;
        }

        tools.forEach(tool => {
            if (tool.created_at) {
                const date = new Date(tool.created_at);
                // التحقق مما إذا كان التاريخ ضمن آخر 6 أشهر تقريباً
                const diffTime = Math.abs(today.getTime() - date.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 180) {
                    const key = date.toLocaleString('en-US', { month: 'short' });
                    if (Object.prototype.hasOwnProperty.call(months, key)) {
                        months[key]++;
                    }
                }
            }
        });

        return Object.entries(months).map(([name, count]) => ({ name, count }));
    }, [tools]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            {/* القسم الأول: توزيع التصنيفات (دائري) */}
            <Card className="bg-black/20 border-white/10 overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <PieChartIcon className="w-4 h-4 text-neon-purple" />
                        توزيع التصنيفات
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full text-xs" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50} // تصميم الدونات (Donut Chart)
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {categoryData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* القسم الثاني: النمو الشهري (أعمدة) */}
            <Card className="bg-black/20 border-white/10 overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <BarChart3 className="w-4 h-4 text-neon-blue" />
                        الأدوات المضافة شهرياً
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full text-xs" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={growthData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                                <YAxis stroke="#666" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                    itemStyle={{ color: '#82ca9d' }}
                                />
                                <Bar dataKey="count" name="عدد الأدوات" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

export default AdminCharts;
