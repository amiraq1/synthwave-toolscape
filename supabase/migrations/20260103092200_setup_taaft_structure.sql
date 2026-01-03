-- ============================================
-- TAAFT-STYLE DATA STRUCTURE & RANKING ALGORITHM
-- Implements trending scores, tasks taxonomy, and Arabic localization scoring
-- ============================================

-- 1. Enhance Tools Table with TAAFT & Localization Fields
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS tasks TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS arabic_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS release_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS clicks_count BIGINT DEFAULT 0;

-- Add constraints for arabic_score (0-10 scale)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tools_arabic_score_check'
  ) THEN
    ALTER TABLE public.tools ADD CONSTRAINT tools_arabic_score_check 
    CHECK (arabic_score >= 0 AND arabic_score <= 10);
  END IF;
END $$;

-- Add comments for clarity
COMMENT ON COLUMN public.tools.tasks IS 'Array of tasks/use-cases (e.g. writing, summarizing, coding)';
COMMENT ON COLUMN public.tools.arabic_score IS 'Arabic support score 0-10 (0=none, 10=fully localized)';
COMMENT ON COLUMN public.tools.release_date IS 'Tool release/launch date for recency calculations';
COMMENT ON COLUMN public.tools.clicks_count IS 'Total clicks/visits for popularity tracking';

-- 2. Create index for tasks array search
CREATE INDEX IF NOT EXISTS idx_tools_tasks ON public.tools USING GIN (tasks);
CREATE INDEX IF NOT EXISTS idx_tools_release_date ON public.tools (release_date DESC);

-- 3. Create "Trending Score" Function (The Ranking Algorithm)
-- Formula: (Rating * 20) + (Reviews Count * 5) + (Newness Bonus) + (Arabic Boost * 10)
CREATE OR REPLACE FUNCTION get_tool_score(
  p_avg_rating numeric, 
  p_reviews_count int, 
  p_release_date date,
  p_arabic_score int
) RETURNS numeric AS $$
DECLARE
  days_old int;
  recency_bonus numeric;
  rating_score numeric;
  reviews_score numeric;
  arabic_bonus numeric;
BEGIN
  -- Calculate days since release
  days_old := CURRENT_DATE - COALESCE(p_release_date, CURRENT_DATE - 365);
  
  -- Recency Bonus: Tools released in the last 30 days get extra points (degrading)
  IF days_old < 30 THEN
    recency_bonus := 100 - (days_old * 3); -- Max 100, decreases by 3/day
  ELSE
    recency_bonus := 0;
  END IF;

  -- Rating Score (max 100 for 5-star rating)
  rating_score := COALESCE(p_avg_rating, 0) * 20;
  
  -- Reviews Score (more reviews = higher score, capped soft at 50 reviews)
  reviews_score := LEAST(COALESCE(p_reviews_count, 0) * 5, 250);
  
  -- Arabic Support Bonus (strategic weighting for Arabic-first platform)
  arabic_bonus := COALESCE(p_arabic_score, 0) * 10; -- Max 100

  -- Total Score
  RETURN rating_score + reviews_score + recency_bonus + arabic_bonus;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Create View for Ranked Tools (optional, for easy querying)
CREATE OR REPLACE VIEW public.tools_ranked AS
SELECT 
  t.*,
  COALESCE(rs.average_rating, 0) as avg_rating,
  COALESCE(rs.reviews_count, 0) as total_reviews,
  get_tool_score(
    rs.average_rating::numeric,
    rs.reviews_count::int,
    t.release_date,
    t.arabic_score
  ) as trending_score
FROM public.tools t
LEFT JOIN LATERAL (
  SELECT 
    ROUND(AVG(r.rating)::numeric, 1) as average_rating,
    COUNT(r.id) as reviews_count
  FROM public.reviews r
  WHERE r.tool_id = t.id
) rs ON true
ORDER BY trending_score DESC;

-- 5. Function to increment click count (for analytics)
CREATE OR REPLACE FUNCTION increment_tool_clicks(p_tool_id BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE public.tools 
  SET clicks_count = COALESCE(clicks_count, 0) + 1
  WHERE id = p_tool_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC Function to get ranked tools with pagination
CREATE OR REPLACE FUNCTION get_trending_tools(
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0,
  p_category text DEFAULT NULL,
  p_task text DEFAULT NULL
)
RETURNS TABLE (
  id bigint,
  title text,
  description text,
  category text,
  pricing_type text,
  url text,
  image_url text,
  is_featured boolean,
  tasks text[],
  arabic_score int,
  avg_rating numeric,
  total_reviews bigint,
  trending_score numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.category,
    t.pricing_type,
    t.url,
    t.image_url,
    t.is_featured,
    t.tasks,
    t.arabic_score,
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) as avg_rating,
    COUNT(r.id) as total_reviews,
    get_tool_score(
      AVG(r.rating)::numeric,
      COUNT(r.id)::int,
      t.release_date,
      t.arabic_score
    ) as trending_score
  FROM public.tools t
  LEFT JOIN public.reviews r ON r.tool_id = t.id
  WHERE 
    (p_category IS NULL OR t.category = p_category)
    AND (p_task IS NULL OR p_task = ANY(t.tasks))
  GROUP BY t.id
  ORDER BY trending_score DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Seed some sample tasks for existing tools (optional)
-- UPDATE public.tools SET tasks = ARRAY['writing', 'content-creation'] WHERE category ILIKE '%كتابة%';
-- UPDATE public.tools SET tasks = ARRAY['image-generation', 'design'] WHERE category ILIKE '%صور%';
-- UPDATE public.tools SET tasks = ARRAY['coding', 'development'] WHERE category ILIKE '%برمجة%';
