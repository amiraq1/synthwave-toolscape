import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  tool_id: number;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: {
    display_name: string | null;
  } | null;
}

export interface ToolWithRating {
  tool_id: number;
  average_rating: number;
  review_count: number;
}

export const useReviews = (toolId: number) => {
  return useQuery({
    queryKey: ['reviews', toolId],
    queryFn: async () => {
      // Fetch reviews without profile join for security
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('tool_id', toolId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch display names securely using the security definer function
      const reviewsWithProfiles = await Promise.all(
        (reviews || []).map(async (review) => {
          const { data: displayName } = await supabase
            .rpc('get_display_name', { profile_id: review.user_id });
          
          return {
            ...review,
            profiles: { display_name: displayName }
          } as Review;
        })
      );
      
      return reviewsWithProfiles;
    },
  });
};

export const useToolRatings = () => {
  return useQuery({
    queryKey: ['tool-ratings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('tool_id, rating');

      if (error) throw error;

      // Calculate averages per tool
      const ratingsMap = new Map<number, { total: number; count: number }>();
      
      data.forEach((review) => {
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

export const useAddReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      toolId, 
      userId, 
      rating, 
      comment 
    }: { 
      toolId: number; 
      userId: string; 
      rating: number; 
      comment: string;
    }) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          tool_id: toolId,
          user_id: userId,
          rating,
          comment: comment.trim() || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.toolId] });
      queryClient.invalidateQueries({ queryKey: ['tool-ratings'] });
    },
  });
};

export const useUserReview = (toolId: number, userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-review', toolId, userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('tool_id', toolId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};
