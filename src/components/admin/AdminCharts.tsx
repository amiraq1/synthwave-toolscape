
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
import { useTranslation } from 'react-i18next';

// Admin Charts Component - Optimized & No Search Calls
interface Tool {
    category: string;
    created_at?: string;
}

interface AdminChartsProps {
    tools: Tool[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a0c4ff', '#bdb2ff'];

const AdminCharts = ({ tools }: AdminChartsProps) => {
    const { i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        tools.forEach(tool => {
            const cat = tool.category || 'Other';
            counts[cat] = (counts[cat] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [tools]);

    const growthData = useMemo(() => {
        const months: Record<string, number> = {};
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = d.toLocaleString('en-US', { month: 'short' });
            months[key] = 0;
        }

        tools.forEach(tool => {
            if (tool.created_at) {
                const date = new Date(tool.created_at);
                const diffTime = Math.abs(today.getTime() - date.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 180) {
                    const key = date.toLocaleString('en-US', { month: 'short' });
                    // eslint-disable-next-line no-prototype-builtins
                    if (months.hasOwnProperty(key)) {
                        months[key]++;
                    }
                }
            }
        });

        // Convert to array for Recharts
        const result = Object.entries(months).map(([name, count]) => ({ name, count }));
        return result;
    }, [tools]);

    if (!tools || tools.length === 0) {
        return <div className="text-center p-4 text-gray-500">No data available for charts</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

            <Card className="bg-black/20 border-white/10 overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <PieChartIcon className="w-4 h-4 text-neon-purple" />
                        {isAr ? 'توزيع التصنيفات' : 'Category Distribution'}
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
                                    innerRadius={50}
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

            <Card className="bg-black/20 border-white/10 overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <BarChart3 className="w-4 h-4 text-neon-blue" />
                        {isAr ? 'الأدوات المضافة شهرياً' : 'Tools Added Per Month'}
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
                                <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} name={isAr ? 'العدد' : 'Count'} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

export default AdminCharts;
