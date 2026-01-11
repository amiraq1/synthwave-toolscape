-- Fix match_tools: Add missing 'slug' column
-- This fixes the 500 Internal Server Error in chat function

-- Drop existing function first (signature might conflict)
DROP FUNCTION IF EXISTS match_tools(vector(768), float, int);

-- Recreate with slug column included
CREATE OR REPLACE FUNCTION match_tools(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id bigint,
  slug text,           -- ✅ Added missing slug column
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
    t.slug,            -- ✅ Now selecting slug
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION match_tools(vector(768), float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION match_tools(vector(768), float, int) TO anon;
GRANT EXECUTE ON FUNCTION match_tools(vector(768), float, int) TO service_role;

COMMENT ON FUNCTION match_tools IS 'Semantic search: Find tools matching a query embedding (includes slug for URL generation)';
