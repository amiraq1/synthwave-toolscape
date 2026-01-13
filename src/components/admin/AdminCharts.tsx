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

interface Tool {
    category: string;
    created_at?: string;
}

interface AdminChartsProps {
    tools: Tool[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a0c4ff', '#bdb2ff'];

const AdminCharts = ({ tools }: AdminChartsProps) => {

    // 1. Prepare data for Category Distribution (Pie Chart)
    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        tools.forEach(tool => {
            const cat = tool.category || 'Other';
            counts[cat] = (counts[cat] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8); // Top 8 categories
    }, [tools]);

    // 2. Prepare data for Monthly Growth (Bar Chart) - Last 6 months
    const growthData = useMemo(() => {
        const months: Record<string, number> = {};
        const today = new Date();

        // Initialize last 6 months with 0
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const key = d.toLocaleString('en-US', { month: 'short' });
            months[key] = 0;
        }

        tools.forEach(tool => {
            if (tool.created_at) {
                const date = new Date(tool.created_at);
                // Check if within last 6 months
                const diffTime = Math.abs(today.getTime() - date.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 180) { // Approx 6 months
                    const key = date.toLocaleString('en-US', { month: 'short' });
                    if (months.hasOwnProperty(key)) {
                        months[key]++;
                    }
                }
            }
        });

        return Object.entries(months).map(([name, count]) => ({ name, count }));
    }, [tools]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Category Distribution */}
            <Card className="bg-black/20 border-white/10">
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
                                    innerRadius={50}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#333', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Monthly Growth */}
            <Card className="bg-black/20 border-white/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        النمو الشهري
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px] w-full text-xs" dir="ltr">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={growthData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1a1a2e', borderColor: '#333', color: '#fff' }}
                                />
                                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="الأدوات" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminCharts;
