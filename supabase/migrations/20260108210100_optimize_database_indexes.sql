-- 1. Enable pg_trgm extension (essential for smart and fast text search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Index Titles and Descriptions (Trigram Indexes)
-- GIN is powerful for partial search (e.g., %design%)
CREATE INDEX IF NOT EXISTS idx_tools_title_trgm ON tools USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tools_description_trgm ON tools USING gin (description gin_trgm_ops);

-- 3. Index Common Filter Columns (Standard B-Tree)
-- Makes switching tabs (Video, Coding, Free) instant
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools (category);
CREATE INDEX IF NOT EXISTS idx_tools_pricing ON tools (pricing_type);
CREATE INDEX IF NOT EXISTS idx_tools_published ON tools (is_published);

-- 4. Composite Index for Complex Scenarios
-- This "smart" index speeds up the most common homepage query:
-- "Fetch published tools + in a specific category + sorted by newest to oldest"
CREATE INDEX IF NOT EXISTS idx_tools_listing_optimized 
ON tools (is_published, category, created_at DESC);

-- 5. Index Foreign Keys
-- To speed up fetching reviews when opening a specific tool page
CREATE INDEX IF NOT EXISTS idx_reviews_tool_id ON reviews (tool_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks (user_id);
