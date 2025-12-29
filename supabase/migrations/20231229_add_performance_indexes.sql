-- ============================================
-- Database Indexes for Performance Optimization
-- ============================================
-- Run these SQL commands in Supabase SQL Editor
-- to improve search and filter performance.
-- ============================================

-- Index for category filtering (most common filter)
CREATE INDEX IF NOT EXISTS idx_tools_category 
ON public.tools (category);

-- Index for title search (used in ILIKE queries)
CREATE INDEX IF NOT EXISTS idx_tools_title_trgm 
ON public.tools USING gin (title gin_trgm_ops);

-- Index for description search (used in ILIKE queries)
CREATE INDEX IF NOT EXISTS idx_tools_description_trgm 
ON public.tools USING gin (description gin_trgm_ops);

-- Index for featured tools (sorted first)
CREATE INDEX IF NOT EXISTS idx_tools_is_featured 
ON public.tools (is_featured DESC);

-- Composite index for common query pattern (category + featured)
CREATE INDEX IF NOT EXISTS idx_tools_category_featured 
ON public.tools (category, is_featured DESC);

-- Index for reviews by tool (for faster review loading)
CREATE INDEX IF NOT EXISTS idx_reviews_tool_id 
ON public.public_reviews (tool_id);

-- Index for reviews by user (for user's review history)
CREATE INDEX IF NOT EXISTS idx_reviews_user_id 
ON public.public_reviews (user_id);

-- ============================================
-- NOTE: For trigram indexes to work, you need
-- to enable the pg_trgm extension first:
-- ============================================
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- ============================================

-- Analyze tables to update statistics
ANALYZE public.tools;
ANALYZE public.public_reviews;
