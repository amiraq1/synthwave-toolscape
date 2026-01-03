-- ============================================
-- REVIEWS SYSTEM MIGRATION
-- Full review system with ratings and comments
-- ============================================

-- 1. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tool_id BIGINT REFERENCES public.tools(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tool_id) -- One review per user per tool
);

-- 2. Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Public Read: Anyone can view reviews
CREATE POLICY "Public reviews are viewable by everyone" 
ON public.reviews FOR SELECT 
USING (true);

-- Authenticated Insert: Users can add their own reviews
CREATE POLICY "Users can insert their own reviews" 
ON public.reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Authenticated Update: Users can update only their own reviews
CREATE POLICY "Users can update their own reviews" 
ON public.reviews FOR UPDATE 
USING (auth.uid() = user_id);

-- Authenticated Delete: Users can delete only their own reviews
CREATE POLICY "Users can delete their own reviews" 
ON public.reviews FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_tool_id ON public.reviews(tool_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- 5. Function to get review stats for a tool
CREATE OR REPLACE FUNCTION get_tool_review_stats(p_tool_id BIGINT)
RETURNS TABLE (
  average_rating NUMERIC,
  reviews_count BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as average_rating,
    COUNT(r.id) as reviews_count
  FROM public.reviews r
  WHERE r.tool_id = p_tool_id;
END;
$$;

-- 6. Add comment
COMMENT ON TABLE public.reviews IS 'User reviews and ratings for AI tools';
