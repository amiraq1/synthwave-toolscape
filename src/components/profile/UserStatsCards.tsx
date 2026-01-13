import { Heart, MessageSquare, Star, Calendar, TrendingUp } from "lucide-react";
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
}

const StatCard = ({ label, value, icon, colorClass, trend }: StatCardProps) => (
    <div className={cn(
        "relative overflow-hidden rounded-2xl border bg-white/5 p-6 transition-all hover:bg-white/10 hover:scale-[1.02]",
        "border-white/10 hover:border-white/20"
    )}>
        {/* Background glow effect */}
        <div className={cn(
            "absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20",
            colorClass
        )} />

        <div className="relative z-10">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", colorClass.replace('bg-', 'bg-').replace('/50', '/20'))}>
                {icon}
            </div>
            <p className="text-3xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
            {trend && (
                <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                    <TrendingUp className="w-3 h-3" />
                    {trend}
                </div>
            )}
        </div>
    </div>
);

const ActivityBadge = ({ level }: { level: 'very_active' | 'active' | 'inactive' }) => {
    const config = {
        very_active: { label: 'نشط جداً', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
        active: { label: 'نشط', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
        inactive: { label: 'خامل', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    };

    return (
        <span className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border",
            config[level].color
        )}>
            {config[level].label}
        </span>
    );
};

const UserStatsCards = ({ stats }: { stats: UserStats }) => {
    return (
        <div className="space-y-4 mb-8">
            {/* Activity badge */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">إحصائياتك</h2>
                <ActivityBadge level={stats.activityLevel} />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="المفضلة"
                    value={stats.bookmarksCount}
                    icon={<Heart className="w-6 h-6 text-red-400" />}
                    colorClass="bg-red-500/50"
                />
                <StatCard
                    label="المراجعات"
                    value={stats.reviewsCount}
                    icon={<MessageSquare className="w-6 h-6 text-blue-400" />}
                    colorClass="bg-blue-500/50"
                />
                <StatCard
                    label="متوسط التقييم"
                    value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '-'}
                    icon={<Star className="w-6 h-6 text-yellow-400" />}
                    colorClass="bg-yellow-500/50"
                />
                <StatCard
                    label="يوم منذ الانضمام"
                    value={stats.joinedDaysAgo}
                    icon={<Calendar className="w-6 h-6 text-purple-400" />}
                    colorClass="bg-purple-500/50"
                />
            </div>
        </div>
    );
};

export default UserStatsCards;
