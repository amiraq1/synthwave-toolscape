-- 1. إضافة عمود "حالة النشر"
-- الافتراضي TRUE للأدوات القديمة حتى لا تختفي
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- 2. تحديث سياسات الأمان (RLS)
-- نحذف السياسات القديمة لتجنب التضارب
DROP POLICY IF EXISTS "Enable read access for all users" ON tools;
DROP POLICY IF EXISTS "Public can view tools" ON tools;
DROP POLICY IF EXISTS "Public view published tools" ON tools;
DROP POLICY IF EXISTS "Admins view all tools" ON tools;
DROP POLICY IF EXISTS "Admins manage tools" ON tools;

-- السياسة أ: الجمهور يرى فقط الأدوات المنشورة
CREATE POLICY "Public view published tools"
ON tools FOR SELECT
USING (is_published = true);

-- السياسة ب: الأدمن (أنت) يرى كل شيء (بما فيه المسودات)
CREATE POLICY "Admins view all tools"
ON tools FOR SELECT
USING (auth.role() = 'authenticated');

-- السياسة ج: الأدمن يمكنه الإضافة والتعديل والحذف
CREATE POLICY "Admins manage tools"
ON tools FOR ALL
USING (auth.role() = 'authenticated');
