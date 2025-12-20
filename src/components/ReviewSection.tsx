import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useReviews, useAddReview, useUserReview } from '@/hooks/useReviews';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ReviewSectionProps {
  toolId: number;
}

const ReviewSection = ({ toolId }: ReviewSectionProps) => {
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: reviews = [], isLoading } = useReviews(toolId);
  const { data: userReview } = useUserReview(toolId, user?.id);
  const addReview = useAddReview();

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: 'يجب تسجيل الدخول',
        description: 'سجل دخولك لإضافة مراجعة',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (newRating === 0) {
      toast({
        title: 'اختر التقييم',
        description: 'يرجى اختيار عدد النجوم',
        variant: 'destructive',
      });
      return;
    }

    try {
      await addReview.mutateAsync({
        toolId,
        userId: user.id,
        rating: newRating,
        comment: newComment,
      });
      
      toast({
        title: 'تم إضافة المراجعة!',
        description: 'شكراً لمشاركتك',
      });
      
      setNewRating(0);
      setNewComment('');
    } catch (error: any) {
      let message = 'حدث خطأ أثناء إضافة المراجعة';
      if (error.message?.includes('duplicate')) {
        message = 'لقد أضفت مراجعة لهذه الأداة مسبقاً';
      }
      toast({
        title: 'خطأ',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-neon-purple" />
          مراجعات المستخدمين
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">
              {averageRating.toFixed(1)}
            </span>
            <StarRating rating={Math.round(averageRating)} size="md" />
            <span className="text-muted-foreground">
              ({reviews.length} مراجعة)
            </span>
          </div>
        )}
      </div>

      {/* Add Review Form */}
      {!userReview && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-foreground">أضف مراجعتك</h3>
          
          {!user && (
            <p className="text-muted-foreground text-sm">
              <button 
                onClick={() => navigate('/auth')}
                className="text-neon-purple hover:underline"
              >
                سجل دخولك
              </button>
              {' '}لإضافة مراجعة
            </p>
          )}

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">التقييم</label>
            <StarRating
              rating={newRating}
              size="lg"
              interactive={!!user}
              onRatingChange={setNewRating}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">تعليقك (اختياري)</label>
            <Textarea
              placeholder="شاركنا تجربتك مع هذه الأداة..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={!user}
              className="bg-muted/50 border-border/50 min-h-[100px]"
            />
          </div>

          <Button
            onClick={handleSubmitReview}
            disabled={!user || addReview.isPending}
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity"
          >
            {addReview.isPending ? 'جاري الإرسال...' : 'إرسال المراجعة'}
          </Button>
        </div>
      )}

      {userReview && (
        <div className="glass rounded-2xl p-6 border border-neon-purple/30">
          <p className="text-muted-foreground text-sm mb-2">مراجعتك لهذه الأداة:</p>
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={userReview.rating} size="md" />
          </div>
          {userReview.comment && (
            <p className="text-foreground">{userReview.comment}</p>
          )}
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">
          جاري تحميل المراجعات...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          لا توجد مراجعات بعد. كن أول من يراجع هذه الأداة!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="glass rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
                    <User className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {review.profiles?.display_name || 'مستخدم'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} size="sm" />
              </div>
              {review.comment && (
                <p className="text-muted-foreground">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
