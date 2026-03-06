-- Fix vector dimensions for Gemini (768 dims)
-- This migration fixes the 500 Internal Server Error in search

-- 1. Clear existing embeddings (they are incompatible 1536 dims)
UPDATE public.tools SET embedding = NULL;

-- 2. Drop dependent analytics view before altering the vector column.
DROP VIEW IF EXISTS public.tools_with_analytics;
DROP VIEW IF EXISTS public.tools_ranked;

-- 3. Alter column to correct size
ALTER TABLE public.tools ALTER COLUMN embedding TYPE vector(768);

-- 4. Recreate search functions with the new vector shape.
DROP FUNCTION IF EXISTS public.match_tools(vector, double precision, integer);
DROP FUNCTION IF EXISTS public.find_similar_tools(bigint, integer);

-- 5. Update search function to accept 768 dims
CREATE OR REPLACE FUNCTION match_tools(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  title text,
  title_en text,
  description text,
  description_en text,
  category text,
  url text,
  image_url text,
  pricing_type text,
  is_featured boolean,
  is_sponsored boolean,
  supports_arabic boolean,
  average_rating numeric,
  reviews_count bigint,
  similarity float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.title_en,
    t.description,
    t.description_en,
    t.category,
    t.url,
    t.image_url,
    t.pricing_type,
    t.is_featured,
    t.is_sponsored,
    t.supports_arabic,
    t.average_rating,
    t.reviews_count,
    1 - (t.embedding <=> query_embedding) AS similarity
  FROM public.tools t
  WHERE 
    t.embedding IS NOT NULL
    AND 1 - (t.embedding <=> query_embedding) > match_threshold
  ORDER BY t.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 6. Update similar tools function
CREATE OR REPLACE FUNCTION find_similar_tools(
  tool_id bigint,
  limit_count int DEFAULT 5
)
RETURNS TABLE (
  id bigint,
  title text,
  title_en text,
  description text,
  description_en text,
  category text,
  image_url text,
  similarity float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  source_embedding vector(768);
BEGIN
  -- Get the embedding of the source tool
  SELECT t.embedding INTO source_embedding
  FROM public.tools t
  WHERE t.id = tool_id;
  
  -- Return if no embedding found
  IF source_embedding IS NULL THEN
    RETURN;
  END IF;
  
  -- Find similar tools
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.title_en,
    t.description,
    t.description_en,
    t.category,
    t.image_url,
    1 - (t.embedding <=> source_embedding) AS similarity
  FROM public.tools t
  WHERE 
    t.id != tool_id
    AND t.embedding IS NOT NULL
  ORDER BY t.embedding <=> source_embedding
  LIMIT limit_count;
END;
$$;

-- 7. Recreate the analytics view dropped before altering embedding.
CREATE OR REPLACE VIEW public.tools_with_analytics AS
SELECT
  t.*,
  COALESCE(
    (SELECT COUNT(*) FROM public.tool_clicks tc WHERE tc.tool_id = t.id AND tc.clicked_at > NOW() - INTERVAL '7 days'),
    0
  ) AS clicks_last_7_days,
  COALESCE(
    (SELECT COUNT(*) FROM public.tool_clicks tc WHERE tc.tool_id = t.id AND tc.clicked_at > NOW() - INTERVAL '30 days'),
    0
  ) AS clicks_last_30_days
FROM public.tools t;

GRANT SELECT ON public.tools_with_analytics TO anon, authenticated;

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

GRANT SELECT ON public.tools_ranked TO anon, authenticated;
