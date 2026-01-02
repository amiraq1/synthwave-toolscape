-- Fix match_tools function signature mismatch

-- 1. Drop existing function to clean up
DROP FUNCTION IF EXISTS match_tools(vector, float, int);

-- 2. Re-create with explict casting to ensure types match
CREATE OR REPLACE FUNCTION match_tools(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  title text,
  description text,
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
    t.id::bigint,
    t.title::text,
    t.description::text,
    t.category::text,
    t.url::text,
    t.image_url::text,
    t.pricing_type::text,
    COALESCE(t.is_featured, false)::boolean,
    COALESCE(t.is_sponsored, false)::boolean,
    COALESCE(t.supports_arabic, false)::boolean,
    COALESCE(t.average_rating, 0)::numeric,
    COALESCE(t.reviews_count, 0)::bigint,
    (1 - (t.embedding <=> query_embedding))::float8
  FROM public.tools t
  WHERE 
    t.embedding IS NOT NULL
    AND 1 - (t.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
