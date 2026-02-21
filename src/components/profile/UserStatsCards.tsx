import { Heart, MessageSquare, Star, Calendar, TrendingUp, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserStats {
    bookmarksCount: number;
    reviewsCount: number;
    averageRating: number;
    joinedDaysAgo: number;
    activityLevel: 'very_active' | 'active' | 'inactive';
}

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass: string;
    trend?: string;
    delay?: number; // لتأثير الظهور المتتابع
}

const StatCard = ({ label, value, icon, colorClass, trend, delay = 0 }: StatCardProps) => (
    <div
        className={cn(
            "relative overflow-hidden rounded-2xl border bg-black/20 p-6 transition-all duration-300 hover:bg-white/5 hover:scale-[1.02] group",
            "border-white/5 hover:border-white/10 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
        )}
        style={{ animationDelay: `${delay}ms` }}
    >
        {/* Background glow effect */}
        <div className={cn(
            "absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500",
            colorClass
        )} />

        <div className="relative z-10">
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300",
                // استخراج لون الخلفية الشفاف من الكلاس
                colorClass.replace('bg-', 'bg-').replace('/50', '/10')
            )}>
                {icon}
            </div>
            <div className="flex items-end gap-2 mb-1">
                <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
                {trend && (
                    <div className="flex items-center text-xs text-emerald-400 mb-1.5 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {trend}
                    </div>
                )}
            </div>
            <p className="text-sm text-gray-400 font-medium">{label}</p>
        </div>
    </div>
);

const ActivityBadge = ({
    level
}: {
    level: 'very_active' | 'active' | 'inactive';
}) => {
    const config = {
        very_active: {
            label: 'نشط جداً 🔥',
            color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10',
            icon: true
        },
        active: {
            label: 'نشط ⚡',
            color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/10',
            icon: false
        },
        inactive: {
            label: 'خامل 💤',
            color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
            icon: false
        },
    };

    return (
        <span className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm backdrop-blur-md transition-all",
            config[level].color
        )}>
            {level === 'very_active' && (
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
            )}
            {config[level].label}
        </span>
    );
};

const UserStatsCards = ({ stats }: { stats: UserStats }) => {
    return (
        <div className="space-y-5 mb-10">
            {/* Header with Activity Badge */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-neon-purple" />
                    <h2 className="text-xl font-bold text-white">لوحة الإحصائيات</h2>
                </div>
                <ActivityBadge level={stats.activityLevel} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                    label="الأدوات المحفوظة"
                    value={stats.bookmarksCount}
                    icon={<Heart className="w-6 h-6 text-rose-400 fill-rose-400/20" />}
                    colorClass="bg-rose-500/50"
                    delay={0}
                />
                <StatCard
                    label="المراجعات المكتوبة"
                    value={stats.reviewsCount}
                    icon={<MessageSquare className="w-6 h-6 text-blue-400 fill-blue-400/20" />}
                    colorClass="bg-blue-500/50"
                    delay={100}
                />
                <StatCard
                    label="متوسط تقييماتك"
                    value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
                    icon={<Star className="w-6 h-6 text-amber-400 fill-amber-400/20" />}
                    colorClass="bg-amber-500/50"
                    delay={200}
                />
                <StatCard
                    label="أيام في المنصة"
                    value={stats.joinedDaysAgo}
                    icon={<Calendar className="w-6 h-6 text-purple-400" />}
                    colorClass="bg-purple-500/50"
                    delay={300}
                />
            </div>
        </div>
    );
};

export default UserStatsCards;
