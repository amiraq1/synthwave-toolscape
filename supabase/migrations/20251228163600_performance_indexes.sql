-- Add unique index on tools(slug) for faster lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);

-- Add index on category_id for filtering speed
CREATE INDEX IF NOT EXISTS idx_tools_category_id ON tools(category_id);

-- Add index on is_featured for homepage queries
CREATE INDEX IF NOT EXISTS idx_tools_is_featured ON tools(is_featured);

-- Add index on admin_users(id) for faster RLS
CREATE INDEX IF NOT EXISTS idx_admin_users_id ON admin_users(id);

-- Add comments for documentation
COMMENT ON INDEX idx_tools_slug IS 'Optimizes tool lookups by slug';
COMMENT ON INDEX idx_tools_category_id IS 'Optimizes filtering tools by category';
COMMENT ON INDEX idx_tools_is_featured IS 'Optimizes fetching featured tools';
