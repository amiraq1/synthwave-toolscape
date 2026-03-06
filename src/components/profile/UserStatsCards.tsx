import type { ReactNode } from "react";
import { Calendar, Heart, MessageSquare, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserStats {
  bookmarksCount: number;
  reviewsCount: number;
  averageRating: number;
  joinedDaysAgo: number;
  activityLevel: "very_active" | "active" | "inactive";
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  accentClassName: string;
  trend?: string;
}

const StatCard = ({ label, value, icon, accentClassName, trend }: StatCardProps) => (
  <div className="editorial-soft-card relative overflow-hidden p-6 transition-transform duration-300 hover:-translate-y-1">
    <div
      className={cn(
        "absolute inset-x-auto left-0 top-0 h-full w-1.5 rounded-full opacity-80",
        accentClassName,
      )}
    />
    <div className="space-y-4 ps-2">
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-[0_12px_24px_rgba(15,23,42,0.12)]",
          accentClassName,
        )}
      >
        {icon}
      </div>
      <div>
        <p className="mb-1 text-3xl font-bold text-slate-950">{value}</p>
        <p className="text-sm text-slate-600">{label}</p>
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs font-medium text-teal-700">
          <TrendingUp className="h-3.5 w-3.5" />
          {trend}
        </div>
      )}
    </div>
  </div>
);

const ActivityBadge = ({
  level,
}: {
  level: "very_active" | "active" | "inactive";
}) => {
  const config = {
    very_active: {
      label: "نشط جداً",
      className: "border-emerald-300 bg-emerald-50 text-emerald-700",
    },
    active: {
      label: "نشط",
      className: "border-sky-300 bg-sky-50 text-sky-700",
    },
    inactive: {
      label: "خامل",
      className: "border-slate-300 bg-slate-100 text-slate-600",
    },
  };

  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-semibold",
        config[level].className,
      )}
    >
      {config[level].label}
    </span>
  );
};

const UserStatsCards = ({ stats }: { stats: UserStats }) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-slate-950">
            إحصائياتك
          </h2>
          <p className="text-sm text-slate-600">
            نظرة سريعة على نشاطك داخل المنصة.
          </p>
        </div>
        <ActivityBadge level={stats.activityLevel} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="المفضلة"
          value={stats.bookmarksCount}
          icon={<Heart className="h-5 w-5" />}
          accentClassName="bg-rose-500"
        />
        <StatCard
          label="المراجعات"
          value={stats.reviewsCount}
          icon={<MessageSquare className="h-5 w-5" />}
          accentClassName="bg-sky-500"
        />
        <StatCard
          label="متوسط التقييم"
          value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "-"}
          icon={<Star className="h-5 w-5" />}
          accentClassName="bg-amber-500"
        />
        <StatCard
          label="أيام العضوية"
          value={stats.joinedDaysAgo}
          icon={<Calendar className="h-5 w-5" />}
          accentClassName="bg-teal-600"
        />
      </div>
    </div>
  );
};

export default UserStatsCards;
