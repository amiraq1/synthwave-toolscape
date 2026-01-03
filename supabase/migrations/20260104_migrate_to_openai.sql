-- 1. Adjust Embedding Column for OpenAI (1536 dimensions)
-- We drop the old column to avoid type mismatch errors
ALTER TABLE tools DROP COLUMN IF EXISTS embedding;
ALTER TABLE tools ADD COLUMN embedding vector(1536);

-- 2. Update Search Function
CREATE OR REPLACE FUNCTION match_tools (
  query_embedding vector(1536),
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
