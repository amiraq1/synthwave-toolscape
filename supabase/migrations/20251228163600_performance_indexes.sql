-- Performance indexes for tools table
-- Note: Only create indexes on columns that actually exist

-- Add index on is_featured for homepage queries (if column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tools' AND column_name = 'is_featured') THEN
    CREATE INDEX IF NOT EXISTS idx_tools_is_featured ON tools(is_featured);
  END IF;
END $$;

-- The following indexes are commented out because the columns don't exist:
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
-- CREATE INDEX IF NOT EXISTS idx_tools_category_id ON tools(category_id);
-- CREATE INDEX IF NOT EXISTS idx_admin_users_id ON admin_users(id);
