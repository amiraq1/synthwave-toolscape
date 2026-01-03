-- 1. Drop dependencies first (View and Function) with CASCADE to be safe
DROP VIEW IF EXISTS public.tools_ranked CASCADE;
DROP FUNCTION IF EXISTS match_tools(vector, float, int);
DROP FUNCTION IF EXISTS match_tools(vector, double precision, int);

-- 2. Modify the column to be compatible with Gemini (768)
ALTER TABLE tools DROP COLUMN IF EXISTS embedding;
ALTER TABLE tools ADD COLUMN embedding vector(768);

-- 3. Recreate the View
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

-- 4. Recreate the search function with correct dimensions (768)
CREATE OR REPLACE FUNCTION match_tools (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id text,
  title text,
  description text,
  category text,
  pricing_type text,
  url text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tools.id,
    tools.title,
    tools.description,
    tools.category,
    tools.pricing_type,
    tools.url,
    1 - (tools.embedding <=> query_embedding) AS similarity
  FROM tools
  WHERE 1 - (tools.embedding <=> query_embedding) > match_threshold
  ORDER BY tools.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
