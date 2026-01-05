-- ================================================
-- SQL SCRIPT: تنظيف الأدوات المكررة والاختبارية
-- قم بتنفيذ هذا الملف في Supabase SQL Editor
-- ================================================

-- 1. عرض الأدوات المكررة قبل الحذف
SELECT id, title, description, created_at
FROM public.tools
WHERE LOWER(title) IN (
  SELECT LOWER(title)
  FROM public.tools
  GROUP BY LOWER(title)
  HAVING COUNT(*) > 1
)
ORDER BY LOWER(title), id;

-- 2. حذف التكرارات (الاحتفاظ بالأحدث)
WITH duplicates AS (
  SELECT id, title,
         ROW_NUMBER() OVER (PARTITION BY LOWER(title) ORDER BY id DESC) as rn
  FROM public.tools
)
DELETE FROM public.tools 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 3. حذف أدوات الاختبار
DELETE FROM public.tools 
WHERE LOWER(title) LIKE '%test%'
   OR LOWER(title) LIKE '%تجربة%'
   OR LOWER(title) LIKE '%اختبار%'
   OR LOWER(title) LIKE '%demo%'
   OR LOWER(title) LIKE '%sample%'
   OR LOWER(title) LIKE '%lorem%';

-- 4. التحقق من النتيجة
SELECT COUNT(*) as total_tools FROM public.tools;
