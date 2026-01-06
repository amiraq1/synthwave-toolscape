-- Migration: add bookmarks table with RLS and policies
-- 1. إنشاء جدول المفضلة
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id UUID REFERENCES auth.users NOT NULL,
  tool_id TEXT REFERENCES tools(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, tool_id)
);

-- 2. تفعيل الحماية (RLS)
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- 3. السياسات (Policies)
-- المستخدم يرى مفضلته فقط
-- Ensure policies are idempotent: drop if exist, then create
DROP POLICY IF EXISTS "Users view own bookmarks" ON bookmarks;
CREATE POLICY "Users view own bookmarks" ON bookmarks 
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users add bookmarks" ON bookmarks;
CREATE POLICY "Users add bookmarks" ON bookmarks 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete bookmarks" ON bookmarks;
CREATE POLICY "Users delete bookmarks" ON bookmarks 
FOR DELETE USING (auth.uid() = user_id);

-- Optional: grant basic privileges to authenticated role (adjust if needed)
GRANT SELECT, INSERT, DELETE ON bookmarks TO authenticated;
