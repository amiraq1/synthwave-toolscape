-- ============================================
-- Vector Search Infrastructure for AI Agent
-- Enables semantic search using OpenAI embeddings
-- ============================================

-- 1) Enable the pgvector extension
-- This provides vector similarity search capabilities
CREATE EXTENSION IF NOT EXISTS vector;

-- 2) Add embedding column to tools table
-- Using 1536 dimensions for OpenAI's text-embedding-3-small model
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tools' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE public.tools ADD COLUMN embedding vector(1536);
  END IF;
END $$;

-- 3) Create an index for fast similarity search
-- Using ivfflat for approximate nearest neighbor search
-- Note: For production with >1000 rows, rebuild with more lists
CREATE INDEX IF NOT EXISTS idx_tools_embedding 
ON public.tools 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 4) Create the match_tools function for semantic search
CREATE OR REPLACE FUNCTION match_tools(
  query_embedding vector(1536),
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION match_tools(vector(1536), float, int) TO authenticated;
GRANT EXECUTE ON FUNCTION match_tools(vector(1536), float, int) TO anon;

-- 5) Create a helper function to generate embeddings for a tool
-- This can be called after inserting/updating a tool to generate its embedding
CREATE OR REPLACE FUNCTION generate_tool_search_text(tool_row public.tools)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Combine relevant fields for embedding generation
  RETURN COALESCE(tool_row.title, '') || ' ' ||
         COALESCE(tool_row.description, '') || ' ' ||
         COALESCE(tool_row.category, '') || ' ' ||
         COALESCE(tool_row.pricing_type, '') || ' ' ||
         COALESCE(array_to_string(tool_row.features, ' '), '');
END;
$$;

-- 6) Create a function to find similar tools (for recommendations)
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
  source_embedding vector(1536);
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
GRANT EXECUTE ON FUNCTION find_similar_tools(bigint, int) TO authenticated;
GRANT EXECUTE ON FUNCTION find_similar_tools(bigint, int) TO anon;

-- Add documentation comments
COMMENT ON COLUMN public.tools.embedding IS 'Vector embedding (1536 dims) for semantic search using OpenAI text-embedding-3-small';
COMMENT ON FUNCTION match_tools IS 'Semantic search: Find tools matching a query embedding above threshold';
COMMENT ON FUNCTION find_similar_tools IS 'Find similar tools based on embedding similarity';
COMMENT ON FUNCTION generate_tool_search_text IS 'Helper to generate searchable text from tool fields';
