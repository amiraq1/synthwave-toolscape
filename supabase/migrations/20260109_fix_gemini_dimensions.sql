-- Fix vector dimensions for Gemini (768 dims)
-- This migration fixes the 500 Internal Server Error in search

-- 1. Clear existing embeddings (they are incompatible 1536 dims)
UPDATE public.tools SET embedding = NULL;

-- 2. Alter column to correct size
ALTER TABLE public.tools ALTER COLUMN embedding TYPE vector(768);

-- 3. Update search function to accept 768 dims
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

-- 4. Update similar tools function
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
