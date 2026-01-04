-- Migration: Revert to Gemini Embeddings (768 dimensions)
-- Date: 2026-01-04
-- Description: Revert embedding column to 768 dimensions for Gemini, recreate views and functions

-- 1. Revert Embedding Column to Gemini (768 dimensions)
DROP VIEW IF EXISTS public.tools_ranked;
DROP VIEW IF EXISTS public.tools_with_analytics;

ALTER TABLE tools DROP COLUMN IF EXISTS embedding;
ALTER TABLE tools ADD COLUMN embedding vector(768);

-- 2. Recreate the views
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

-- 3. Update Search Function for 768 dimensions
DROP FUNCTION IF EXISTS match_tools(vector, float, int);
DROP FUNCTION IF EXISTS match_tools(vector, double precision, int);

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
    tools.id::text,
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

-- 4. Re-enable RLS and set proper policies
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'tools'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.tools', policy_record.policyname);
    END LOOP;
END $$;

-- Public read policy
CREATE POLICY "Public can read tools" 
ON public.tools FOR SELECT 
TO anon, authenticated 
USING (true);

-- Admin write policy (assuming 'admin' role exists in profiles)
CREATE POLICY "Admins can manage tools" 
ON public.tools FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. Grant permissions
GRANT SELECT ON public.tools TO anon, authenticated;
GRANT SELECT ON public.tools_ranked TO anon, authenticated;
GRANT SELECT ON public.tools_with_analytics TO anon, authenticated;
GRANT EXECUTE ON FUNCTION match_tools(vector(768), float, int) TO anon, authenticated;
