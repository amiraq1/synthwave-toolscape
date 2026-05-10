import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Star, ThumbsUp, Filter, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewsSectionProps {
  toolId: string;
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

const ReviewSection = ({ toolId }: ReviewsSectionProps) => {
  const { session } = useAuth();
  const { t, i18n } = useTranslation();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. حالات الفلترة والفرز
  const [sortBy, setSortBy] = useState("newest");
  const [filterRating, setFilterRating] = useState("all");

  // دالة لجلب المراجعات بناءً على الفلاتر
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("reviews")
      .select(`
        *,
        profiles (full_name, avatar_url)
      `)
      .eq("tool_id", parseInt(toolId, 10));

    // تطبيق الفلترة حسب النجوم
    if (filterRating !== "all") {
      query = query.eq("rating", parseInt(filterRating));
    }

    // تطبيق الفرز
    switch (sortBy) {
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "highest":
        query = query.order("rating", { ascending: false });
        break;
      case "lowest":
        query = query.order("rating", { ascending: true });
        break;
    }

    const { data } = await query;
    if (data) setReviews(data as ReviewData[]);
    setLoading(false);
  }, [toolId, sortBy, filterRating]);

  // إعادة الجلب عند تغيير الفلاتر
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // دالة وهمية للتصويت
  const handleHelpful = (_reviewId: string) => {
    toast.success(t('reviews.thanks_vote'));
  };

  return (
    <div className="rounded-[2rem] border border-black/8 bg-white/70 p-5 sm:p-6" id="reviews-section" dir={i18n.dir()}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="flex items-center gap-2 font-editorial text-2xl font-semibold text-slate-950">
          <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
          {t('reviews.title', { count: reviews.length })}
        </h3>

        {/* أدوات التحكم (الفلترة والفرز) */}
        <div className="flex gap-3 w-full md:w-auto">

          {/* قائمة التصفية (النجوم) */}
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-[140px] rounded-full border-black/10 bg-white/80 text-slate-700">
              <Filter className={cn("w-4 h-4 text-slate-400", i18n.dir() === 'rtl' ? "ml-2" : "mr-2")} />
              <SelectValue placeholder={t('reviews.filter')} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-black/10 bg-[#faf6ed] text-slate-900">
              <SelectItem value="all">{t('reviews.filter_all')}</SelectItem>
              <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
              <SelectItem value="4">⭐⭐⭐⭐ (4)</SelectItem>
              <SelectItem value="3">⭐⭐⭐ (3)</SelectItem>
              <SelectItem value="2">⭐⭐ (2)</SelectItem>
              <SelectItem value="1">⭐ (1)</SelectItem>
            </SelectContent>
          </Select>

          {/* قائمة الفرز (الترتيب) */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] rounded-full border-black/10 bg-white/80 text-slate-700">
              <ArrowUpDown className={cn("w-4 h-4 text-slate-400", i18n.dir() === 'rtl' ? "ml-2" : "mr-2")} />
              <SelectValue placeholder={t('reviews.sort')} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-black/10 bg-[#faf6ed] text-slate-900">
              <SelectItem value="newest">{t('reviews.sort_newest')}</SelectItem>
              <SelectItem value="oldest">{t('reviews.sort_oldest')}</SelectItem>
              <SelectItem value="highest">{t('reviews.sort_highest')}</SelectItem>
              <SelectItem value="lowest">{t('reviews.sort_lowest')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* قائمة المراجعات */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-slate-400">{t('reviews.loading')}</div>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="rounded-[1.4rem] border border-black/8 bg-[#f8f4eb] p-4 animate-in fade-in">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[1rem] bg-slate-950 flex items-center justify-center text-white font-bold text-sm">
                    {review.profiles?.full_name?.[0] || t('reviews.anonymous')[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-950 text-sm">{review.profiles?.full_name || t('reviews.anonymous')}</h4>
                    <div className="flex text-amber-500 text-xs mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-slate-300"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(review.created_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                </span>
              </div>

              <p className={cn("text-slate-600 text-sm leading-7 mt-2", i18n.dir() === 'rtl' ? "pr-12" : "pl-12")}>
                {review.comment}
              </p>

              {/* زر "مفيد" */}
              <div className={cn("mt-3", i18n.dir() === 'rtl' ? "pr-12" : "pl-12")}>
                <button
                  onClick={() => handleHelpful(review.id)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-950 transition-colors group"
                >
                  <ThumbsUp className="w-3 h-3 group-hover:text-teal-700" />
                  {t('reviews.helpful')}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 text-slate-400">
            {t('reviews.empty')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
