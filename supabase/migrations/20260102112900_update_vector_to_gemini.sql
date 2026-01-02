-- ============================================
-- Update Vector Dimension for Google Gemini
-- Google text-embedding-004 uses 768 dimensions
-- ============================================

-- Drop the old embedding column and recreate with correct dimensions
-- Note: This will delete existing embeddings (if any)
DO $$
BEGIN
  -- Check if we need to change dimensions
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tools' AND column_name = 'embedding'
  ) THEN
    -- Drop old column
    ALTER TABLE public.tools DROP COLUMN IF EXISTS embedding;
  END IF;
  
  -- Create new column with 768 dimensions (Google Gemini)
  ALTER TABLE public.tools ADD COLUMN embedding vector(768);
END $$;

-- Recreate index for the new dimension
DROP INDEX IF EXISTS idx_tools_embedding;
CREATE INDEX idx_tools_embedding 
ON public.tools 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Update the match_tools function for new dimensions
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

-- Update find_similar_tools for new dimensions
CREATE OR REPLACE FUNCTION find_similar_tools(
  tool_id bigint,
  limit_count int DEFAULT 5
)
RETURNS TABLE (
  id bigint,
  title text,
  description text,
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
    t.description,
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION match_tools(vector(768), float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION match_tools(vector(768), float, int) TO anon;
GRANT EXECUTE ON FUNCTION find_similar_tools(bigint, int) TO authenticated;
GRANT EXECUTE ON FUNCTION find_similar_tools(bigint, int) TO anon;

-- Update documentation
COMMENT ON COLUMN public.tools.embedding IS 'Vector embedding (768 dims) for semantic search using Google text-embedding-004';
