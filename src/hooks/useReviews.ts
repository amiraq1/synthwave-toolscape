import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Review {
  id: string;
  tool_id: number;
  user_id?: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_alias?: string;
}

export interface ReviewStats {
  average_rating: number;
  reviews_count: number;
}

export interface ToolWithRating {
  tool_id: number;
  average_rating: number;
  review_count: number;
}

// Fetch reviews for a specific tool using secure RPC function
export const useReviews = (toolId: number | undefined) => {
  return useQuery({
    queryKey: ['reviews', toolId],
    queryFn: async (): Promise<Review[]> => {
      if (!toolId) return [];

      // Use get_public_reviews RPC function which excludes user_id
      const { data, error } = await supabase
        .rpc('get_public_reviews', { p_tool_id: toolId });

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }

      // Map display_name to reviewer_alias for compatibility
      return (data || []).map((r: any) => ({
        id: r.id,
        tool_id: r.tool_id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        reviewer_alias: r.display_name,
      })) as Review[];
    },
    enabled: !!toolId,
  });
};

// Fetch review stats (average rating & count)
export const useReviewStats = (toolId: number | undefined) => {
  return useQuery({
    queryKey: ['review-stats', toolId],
    queryFn: async (): Promise<ReviewStats> => {
      if (!toolId) return { average_rating: 0, reviews_count: 0 };

      // Try RPC first
      const { data: rpcData, error: rpcError } = await (supabase as any)
        .rpc('get_tool_review_stats', { p_tool_id: toolId });

      if (!rpcError && rpcData?.[0]) {
        return rpcData[0];
      }

      // Fallback: calculate from reviews
      const { data: reviews } = await (supabase as any)
        .from('reviews')
        .select('rating')
        .eq('tool_id', toolId);

      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
        return { average_rating: Math.round(avg * 10) / 10, reviews_count: reviews.length };
      }

      return { average_rating: 0, reviews_count: 0 };
    },
    enabled: !!toolId,
  });
};

// Get all tools ratings using secure RPC function
export const useToolRatings = () => {
  return useQuery({
    queryKey: ['tool-ratings'],
    queryFn: async () => {
      // Use get_public_reviews RPC without tool_id filter to get all reviews
      const { data, error } = await supabase
        .rpc('get_public_reviews', {});

      if (error) throw error;

      // Calculate averages per tool
      const ratingsMap = new Map<number, { total: number; count: number }>();

      (data || []).forEach((review: { tool_id: number; rating: number }) => {
        const existing = ratingsMap.get(review.tool_id) || { total: 0, count: 0 };
        ratingsMap.set(review.tool_id, {
          total: existing.total + review.rating,
          count: existing.count + 1
        });
      });

      const ratings: Record<number, ToolWithRating> = {};
      ratingsMap.forEach((value, toolId) => {
        ratings[toolId] = {
          tool_id: toolId,
          average_rating: value.total / value.count,
          review_count: value.count
        };
      });

      return ratings;
    },
  });
};

// Check if current user has already reviewed
export const useUserReview = (toolId: number | undefined, userId?: string) => {
  const { user } = useAuth();
  const effectiveUserId = userId || user?.id;

  return useQuery({
    queryKey: ['user-review', toolId, effectiveUserId],
    queryFn: async (): Promise<Review | null> => {
      if (!toolId || !effectiveUserId) return null;

      const { data, error } = await (supabase as any)
        .from('reviews')
        .select('*')
        .eq('tool_id', toolId)
        .eq('user_id', effectiveUserId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user review:', error);
        return null;
      }

      return data as Review | null;
    },
    enabled: !!toolId && !!effectiveUserId,
  });
};

// Add or Update a review (Upsert)
export const useAddReview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      toolId,
      rating,
      comment,
      userId
    }: {
      toolId: number;
      rating: number;
      comment?: string;
      userId?: string;
    }) => {
      const effectiveUserId = userId || user?.id;
      if (!effectiveUserId) throw new Error('يجب تسجيل الدخول لإضافة تقييم');

      // Upsert: Insert or Update if exists
      const { data, error } = await (supabase as any)
        .from('reviews')
        .upsert(
          {
            user_id: effectiveUserId,
            tool_id: toolId,
            rating,
            comment: comment?.trim() || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,tool_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: '✅ تم حفظ تقييمك',
        description: 'شكراً لمشاركتك رأيك!',
        className: 'bg-emerald-500/10 text-emerald-500',
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.toolId] });
      queryClient.invalidateQueries({ queryKey: ['review-stats', variables.toolId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', variables.toolId] });
      queryClient.invalidateQueries({ queryKey: ['tool-ratings'] });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error?.message || 'فشل في حفظ التقييم',
        variant: 'destructive',
      });
    },
  });
};

// Delete a review
export const useDeleteReview = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, toolId }: { reviewId: string; toolId: number }) => {
      const { error } = await (supabase as any)
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      return { reviewId, toolId };
    },
    onSuccess: (variables) => {
      toast({
        title: '🗑️ تم حذف التقييم',
        className: 'bg-red-500/10 text-red-500',
      });
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.toolId] });
      queryClient.invalidateQueries({ queryKey: ['review-stats', variables.toolId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', variables.toolId] });
      queryClient.invalidateQueries({ queryKey: ['tool-ratings'] });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error?.message || 'فشل في حذف التقييم',
        variant: 'destructive',
      });
    },
  });
};
