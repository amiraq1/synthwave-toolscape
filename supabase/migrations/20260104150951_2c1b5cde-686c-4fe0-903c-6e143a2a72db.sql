-- ============================================
-- Security Hardening Migration (Part 1)
-- Non-vector functions and policies
-- ============================================

-- ============================================
-- 1. HARDEN get_trending_tools function
-- ============================================
CREATE OR REPLACE FUNCTION public.get_trending_tools(
  p_limit INT DEFAULT 10,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  title TEXT,
  description TEXT,
  category TEXT,
  pricing_type TEXT,
  url TEXT,
  image_url TEXT,
  source TEXT,
  taaft_url TEXT,
  features TEXT[],
  clicks_count INT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  -- Input validation
  IF p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION 'p_limit must be between 1 and 100';
  END IF;
  
  IF p_offset < 0 THEN
    RAISE EXCEPTION 'p_offset must be non-negative';
  END IF;

  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.description,
    t.category,
    t.pricing_type,
    t.url,
    t.image_url,
    t.source,
    t.taaft_url,
    t.features,
    t.clicks_count,
    t.created_at
  FROM public.tools t
  ORDER BY t.clicks_count DESC NULLS LAST, t.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ============================================
-- 2. HARDEN increment_tool_clicks function
-- ============================================
CREATE OR REPLACE FUNCTION public.increment_tool_clicks(p_tool_id BIGINT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate tool exists before incrementing
  IF NOT EXISTS (SELECT 1 FROM public.tools WHERE id = p_tool_id) THEN
    RAISE EXCEPTION 'Tool with id % does not exist', p_tool_id;
  END IF;
  
  UPDATE public.tools 
  SET clicks_count = COALESCE(clicks_count, 0) + 1
  WHERE id = p_tool_id;
END;
$$;

-- ============================================
-- 3. RESTRICT screenshot bucket uploads
-- Drop old permissive policy, add file type validation
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can upload screenshots" ON storage.objects;

CREATE POLICY "Authenticated users can upload valid screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tool-screenshots'
  AND auth.uid() IS NOT NULL
  AND (storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp', 'gif'))
);

-- Allow users to delete their own screenshots
DROP POLICY IF EXISTS "Users can delete own screenshots" ON storage.objects;

CREATE POLICY "Users can delete own screenshots"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tool-screenshots'
  AND auth.uid() = owner
);

-- ============================================
-- 4. FIX reviews table - restrict direct access
-- Remove blanket SELECT, enforce owner-only access
-- ============================================
DROP POLICY IF EXISTS "Reviews readable for public_reviews view" ON public.reviews;

-- Only allow users to see their own reviews directly
CREATE POLICY "Users can view own reviews"
ON public.reviews FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- 5. Create secure function to get public review data
-- This replaces direct access to reviews table
-- ============================================
CREATE OR REPLACE FUNCTION public.get_public_reviews(p_tool_id BIGINT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  tool_id BIGINT,
  rating INT,
  comment TEXT,
  created_at TIMESTAMPTZ,
  display_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    r.id,
    r.tool_id,
    r.rating,
    r.comment,
    r.created_at,
    COALESCE(p.display_name, 'Anonymous') as display_name
  FROM public.reviews r
  LEFT JOIN public.profiles p ON r.user_id = p.id
  WHERE (p_tool_id IS NULL OR r.tool_id = p_tool_id)
  ORDER BY r.created_at DESC;
$$;