-- إضافة عمود للتحكم في النشر (المسودات)
-- Add is_published column to control draft/publish state

ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
-- الافتراضي true للأدوات القديمة

-- تحديث سياسة الأمان (RLS) ليتمكن الزوار من رؤية "المنشور" فقط
DROP POLICY IF EXISTS "Allow public read access" ON tools;
DROP POLICY IF EXISTS "Anyone can view tools" ON tools;

CREATE POLICY "Allow public read access"
ON tools FOR SELECT
USING (is_published = true);

-- السماح للأدمن برؤية كل شيء (بما فيه المسودات)
DROP POLICY IF EXISTS "Allow admin read all" ON tools;

CREATE POLICY "Allow admin read all"
ON tools FOR SELECT
USING (auth.role() = 'authenticated');
