-- ============================================
-- Database Indexes for Performance Optimization
-- ============================================
-- Run these SQL commands in Supabase SQL Editor
-- to improve search and filter performance.
-- ============================================

-- Enable pg_trgm extension for trigram indexes (required for text search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$
BEGIN
  IF to_regclass('public.tools') IS NOT NULL THEN
    -- Index for category filtering (most common filter)
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_tools_category ON public.tools (category)';

    -- Index for title search (used in ILIKE queries)
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_tools_title_trgm ON public.tools USING gin (title gin_trgm_ops)';

    -- Index for description search (used in ILIKE queries)
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_tools_description_trgm ON public.tools USING gin (description gin_trgm_ops)';

    -- Index for featured tools (sorted first)
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_tools_is_featured ON public.tools (is_featured DESC)';

    -- Composite index for common query pattern (category + featured)
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_tools_category_featured ON public.tools (category, is_featured DESC)';

    -- Analyze tables to update statistics
    EXECUTE 'ANALYZE public.tools';
  END IF;

  IF to_regclass('public.reviews') IS NOT NULL THEN
    -- Index for reviews by tool (for faster review loading)
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reviews_tool_id ON public.reviews (tool_id)';

    -- Index for reviews by user (for user history)
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews (user_id)';

    EXECUTE 'ANALYZE public.reviews';
  END IF;
END
$$;
