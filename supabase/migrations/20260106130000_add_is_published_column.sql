-- 1. Add 'is_published' column
-- Default is TRUE so existing tools remain visible.
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- 2. Update RLS Policies
-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON tools;
DROP POLICY IF EXISTS "Public can view tools" ON tools;
DROP POLICY IF EXISTS "Allow public read access" ON tools;
DROP POLICY IF EXISTS "Anyone can view tools" ON tools;

-- Policy A: Public can ONLY see published tools
CREATE POLICY "Public view published tools"
ON tools FOR SELECT
USING (is_published = true);

-- Policy B: Admins/Authenticated users can see EVERYTHING (including drafts)
CREATE POLICY "Admins view all tools"
ON tools FOR SELECT
USING (auth.role() = 'authenticated');

-- Policy C: Allow admins to Insert/Update/Delete
DROP POLICY IF EXISTS "Admins manage tools" ON tools;
CREATE POLICY "Admins manage tools"
ON tools FOR ALL
USING (auth.role() = 'authenticated');
