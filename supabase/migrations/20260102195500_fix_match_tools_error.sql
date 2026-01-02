-- Fix missing average_rating column and update match_tools function

-- 1. Ensure columns exist
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS average_rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviews_count bigint DEFAULT 0;

-- 2. Update match_tools to safely select these columns
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
    t.id,
    t.title,
    t.description,
    t.category,
    t.url,
    t.image_url,
    t.pricing_type,
    t.is_featured,
    t.is_sponsored,
    t.supports_arabic,
    COALESCE(t.average_rating, 0) as average_rating,
    COALESCE(t.reviews_count, 0) as reviews_count,
    1 - (t.embedding <=> query_embedding) AS similarity
  FROM public.tools t
  WHERE 
    t.embedding IS NOT NULL
    AND 1 - (t.embedding <=> query_embedding) > match_threshold
  ORDER BY 1 - (t.embedding <=> query_embedding) DESC
  LIMIT match_count;
END;
$$;
