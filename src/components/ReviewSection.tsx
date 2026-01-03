import { useState } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Star, Loader2, MessageSquare, Trash2, Edit2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  useReviews,
  useReviewStats,
  useUserReview,
  useAddReview,
  useDeleteReview,
  Review
} from '@/hooks/useReviews';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ReviewSectionProps {
  toolId: number;
  toolTitle?: string;
}

// Star Rating Component
const StarRating = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md'
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRatingChange?.(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={cn(
            "transition-all duration-200",
            !readonly && "cursor-pointer hover:scale-110",
            readonly && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              (hoverRating || rating) >= star
                ? "fill-yellow-400 text-yellow-400"
                : "fill-transparent text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
};

// Review Card Component
const ReviewCard = ({
  review,
  isOwner,
  onEdit,
  onDelete
}: {
  review: Review;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="p-4 rounded-xl bg-muted/30 border border-white/5 hover:border-neon-purple/20 transition-all">
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple/30 to-neon-blue/30 flex items-center justify-center shrink-0">
        <User className="w-5 h-5 text-neon-purple" />
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {review.reviewer_alias || 'مستخدم مجهول'}
            </span>
            <StarRating rating={review.rating} readonly size="sm" />
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {format(new Date(review.created_at), 'PPP', { locale: ar })}
            </span>

            {isOwner && (
              <div className="flex gap-1 mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onEdit}
                  className="h-7 w-7 hover:text-neon-purple"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDelete}
                  className="h-7 w-7 hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Comment */}
        {review.comment && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {review.comment}
          </p>
        )}
      </div>
    </div>
  </div>
);

// Main Review Section Component
const ReviewSection = ({ toolId, toolTitle }: ReviewSectionProps) => {
  const { user } = useAuth();
  const { data: reviews, isLoading: reviewsLoading } = useReviews(toolId);
  const { data: stats } = useReviewStats(toolId);
  const { data: userReview } = useUserReview(toolId);
  const addReviewMutation = useAddReview();
  const deleteReviewMutation = useDeleteReview();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  // Initialize form with user's existing review
  const handleEditReview = () => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment || '');
      setIsEditing(true);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) return;

    await addReviewMutation.mutateAsync({
      toolId,
      rating,
      comment,
    });

    // Reset form
    setRating(0);
    setComment('');
    setIsEditing(false);
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    await deleteReviewMutation.mutateAsync({
      reviewId: reviewToDelete,
      toolId,
    });

    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  const openDeleteDialog = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-neon-purple" />
          <h2 className="text-2xl font-bold text-foreground">التقييمات والمراجعات</h2>
        </div>

        {/* Stats Badge */}
        {stats && stats.reviews_count > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400">{stats.average_rating}</span>
            <span className="text-xs text-muted-foreground">({stats.reviews_count} تقييم)</span>
          </div>
        )}
      </div>

      {/* Review Form */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-white/5">
        {!user ? (
          // Not logged in
          <div className="text-center py-6">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">سجل دخولك لتشارك رأيك حول هذه الأداة</p>
            <Button
              variant="outline"
              className="border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10"
              onClick={() => {/* TODO: Open auth modal */ }}
            >
              تسجيل الدخول
            </Button>
          </div>
        ) : userReview && !isEditing ? (
          // User has already reviewed
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">لقد قمت بتقييم هذه الأداة</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <StarRating rating={userReview.rating} readonly />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditReview}
              className="gap-2"
            >
              <Edit2 className="w-4 h-4" />
              تعديل تقييمي
            </Button>
          </div>
        ) : (
          // Review Form
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {isEditing ? 'تعديل تقييمك' : 'قيّم هذه الأداة'}
              </p>
              <StarRating
                rating={rating}
                onRatingChange={setRating}
                size="lg"
              />
            </div>

            <Textarea
              placeholder="اكتب رأيك حول هذه الأداة (اختياري)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] bg-background/50 resize-none"
            />

            <div className="flex gap-2 justify-end">
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setRating(0);
                    setComment('');
                  }}
                >
                  إلغاء
                </Button>
              )}
              <Button
                onClick={handleSubmitReview}
                disabled={rating === 0 || addReviewMutation.isPending}
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 gap-2"
              >
                {addReviewMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Star className="w-4 h-4" />
                    {isEditing ? 'تحديث التقييم' : 'نشر التقييم'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-neon-purple" />
          </div>
        ) : reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isOwner={review.user_id === user?.id}
              onEdit={handleEditReview}
              onDelete={() => openDeleteDialog(review.id)}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">لا توجد تقييمات بعد</p>
            <p className="text-sm text-muted-foreground/70">كن أول من يقيّم هذه الأداة!</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف تقييمك؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف تقييمك نهائياً. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteReviewMutation.isPending}
            >
              {deleteReviewMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'حذف'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReviewSection;
