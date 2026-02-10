-- 1. Add embedding column to posts if it doesn't exist
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 2. Create match_posts function for semantic blog search
CREATE OR REPLACE FUNCTION match_posts(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  excerpt TEXT,
  slug TEXT,
  similarity float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.excerpt,
    p.slug,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM public.posts p
  WHERE 
    p.is_published = true
    AND p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY 1 - (p.embedding <=> query_embedding) DESC
  LIMIT match_count;
END;
$$;

-- 3. Update match_tools to include more metadata for reranking
-- (Already exists, but ensuring it's optimized)
CREATE OR REPLACE FUNCTION match_tools(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.2,
  match_count int DEFAULT 20
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
