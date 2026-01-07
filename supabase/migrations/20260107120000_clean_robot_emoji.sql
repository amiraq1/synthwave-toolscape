-- إزالة إيموجي الروبوت من العناوين
UPDATE tools 
SET title = REPLACE(title, '🤖', '') 
WHERE title LIKE '%🤖%';

-- إزالة إيموجي الروبوت من الأوصاف
UPDATE tools 
SET description = REPLACE(description, '🤖', '') 
WHERE description LIKE '%🤖%';

-- تنظيف المسافات الزائدة التي قد تتبقّى
UPDATE tools 
SET title = TRIM(title), description = TRIM(description);
