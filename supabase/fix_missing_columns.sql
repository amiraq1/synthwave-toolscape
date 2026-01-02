-- Execute this in Supabase SQL Editor for project 'ksdodojvchiybbqxfhcl'
-- This will backfill all missing columns causing the "Error loading data"

-- 1. Add Support/Growth columns (from growth_localization.sql)
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS is_sponsored boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sponsor_expiry timestamptz,
ADD COLUMN IF NOT EXISTS supports_arabic boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS coupon_code text,
ADD COLUMN IF NOT EXISTS deal_expiry timestamptz;

-- 2. Add Vector/AI columns (from vector_search.sql)
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS embedding vector(768); -- Gemini format

-- 3. Add Content Enhancement columns (from enhance_tool_details.sql)
ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS alternatives bigint[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS screenshots text[] DEFAULT '{}';

-- 4. Re-create functions that might fail if columns were missing
CREATE OR REPLACE FUNCTION match_tools(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
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
