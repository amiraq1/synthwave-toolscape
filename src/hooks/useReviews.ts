import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Review {
  id: string;
  tool_id: number;
  user_id?: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_alias?: string;
  avatar_url?: string;
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
export const useReviews = (toolId: string | number | undefined) => {
  return useQuery({
    queryKey: ['reviews', toolId],
    queryFn: async (): Promise<Review[]> => {
      if (!toolId) return [];
      const idAsNumber = Number(toolId);
      if (isNaN(idAsNumber)) return [];

      // Use direct query with join instead of RPC to avoid 404 if migration is missing
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          tool_id
        `)
        .eq('tool_id', idAsNumber)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }

      interface ReviewRow {
        id: string;
        rating: number;
        comment: string | null;
        created_at: string;
        tool_id: number;
      }

      // Map function output to Review shape
      return (data || []).map((r: ReviewRow) => ({
        id: r.id,
        tool_id: idAsNumber,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        reviewer_alias: 'مستخدم',
      })) as Review[];
    },
    enabled: !!toolId,
  });
};

// Fetch review stats (average rating & count)
export const useReviewStats = (toolId: string | number | undefined) => {
  return useQuery({
    queryKey: ['review-stats', toolId],
    queryFn: async (): Promise<ReviewStats> => {
      if (!toolId) return { average_rating: 0, reviews_count: 0 };
      const idAsNumber = Number(toolId);
      if (isNaN(idAsNumber)) return { average_rating: 0, reviews_count: 0 };


      // Try RPC first
      const { data: rpcData, error: rpcError } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .rpc('get_tool_review_stats' as any, { p_tool_id: idAsNumber });

      if (!rpcError && rpcData?.[0]) {
        return rpcData[0];
      }

      // Fallback: calculate from reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('tool_id', idAsNumber);

      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length;
        return { average_rating: Math.round(avg * 10) / 10, reviews_count: reviews.length };
      }

      return { average_rating: 0, reviews_count: 0 };
    },
    enabled: !!toolId,
  });
};

// ... (useToolRatings remains unchanged) ...

// Check if current user has already reviewed
export const useUserReview = (toolId: string | number | undefined, userId?: string) => {
  const { user } = useAuth();
  const effectiveUserId = userId || user?.id;

  return useQuery({
    queryKey: ['user-review', toolId, effectiveUserId],
    queryFn: async (): Promise<Review | null> => {
      if (!toolId || !effectiveUserId) return null;
      const idAsNumber = Number(toolId);
      if (isNaN(idAsNumber)) return null;

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('tool_id', idAsNumber)
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      toolId,
      rating,
      comment,
      userId
    }: {
      toolId: string | number;
      rating: number;
      comment?: string;
      userId?: string;
    }) => {
      const effectiveUserId = userId || user?.id;
      if (!effectiveUserId) throw new Error('يجب تسجيل الدخول لإضافة تقييم');

      const idAsNumber = Number(toolId);
      if (isNaN(idAsNumber)) throw new Error('Invalid Tool ID');

      // Upsert: Insert or Update if exists
      // Upsert: Insert or Update if exists
      const { data, error } = await supabase
        .from('reviews')
        .upsert(
          {
            user_id: effectiveUserId,
            tool_id: idAsNumber,
            rating,
            comment: comment?.trim() || null,
          },
          { onConflict: 'user_id,tool_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success('✅ تم حفظ تقييمك', {
        description: 'شكراً لمشاركتك رأيك!',
      });
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.toolId] });
      queryClient.invalidateQueries({ queryKey: ['review-stats', variables.toolId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', variables.toolId] });
      queryClient.invalidateQueries({ queryKey: ['tool-ratings'] });
    },
    onError: (error: Error) => {
      toast.error('خطأ', {
        description: error?.message || 'فشل في حفظ التقييم',
      });
    },
  });
};

// Delete a review
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, toolId }: { reviewId: string; toolId: string | number }) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      return { reviewId, toolId };
    },
    onSuccess: (variables) => {
      toast.success('🗑️ تم حذف التقييم');
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.toolId] });
      queryClient.invalidateQueries({ queryKey: ['review-stats', variables.toolId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', variables.toolId] });
      queryClient.invalidateQueries({ queryKey: ['tool-ratings'] });
    },
    onError: (error: Error) => {
      toast.error('خطأ', {
        description: error?.message || 'فشل في حذف التقييم',
      });
    },
  });
};
