-- Migration: Cleanup Duplicate Tools
-- Date: 2026-01-05
-- Description: Remove duplicate tools and test data from the database

-- =============================================================================
-- 1. REMOVE DUPLICATE ENTRIES (keeping the one with more features/better data)
-- =============================================================================

-- Delete older duplicate entries, keeping the one with highest ID (most recent/updated)
-- This applies to any tool with duplicate titles
WITH duplicates AS (
  SELECT id, title,
         ROW_NUMBER() OVER (PARTITION BY LOWER(title) ORDER BY id DESC) as rn
  FROM public.tools
)
DELETE FROM public.tools 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- =============================================================================
-- 2. REMOVE ANY TEST TOOLS (if they exist)
-- =============================================================================

-- Delete tools with test-related names
DELETE FROM public.tools 
WHERE LOWER(title) LIKE '%test%'
   OR LOWER(title) LIKE '%تجربة%'
   OR LOWER(title) LIKE '%اختبار%'
   OR LOWER(title) LIKE '%demo%'
   OR LOWER(title) LIKE '%sample%'
   OR LOWER(title) LIKE '%lorem%';

-- =============================================================================
-- 3. ADD UNIQUE CONSTRAINT TO PREVENT FUTURE DUPLICATES
-- =============================================================================

-- Create a unique index on tool title to prevent duplicate entries
-- Using CREATE UNIQUE INDEX IF NOT EXISTS for safety
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tools_unique_title') THEN
    CREATE UNIQUE INDEX idx_tools_unique_title ON public.tools(LOWER(title));
  END IF;
END $$;

-- =============================================================================
-- 4. LOG THE CLEANUP
-- =============================================================================

-- Add a comment for audit purposes
COMMENT ON TABLE public.tools IS 'AI Tools directory - Cleaned up on 2026-01-05';

