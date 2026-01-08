-- إضافة عمود عدد المشاهدات
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS views_count BIGINT DEFAULT 0;

-- دالة لزيادة العدد بشكل آمن (Atomic Increment)
CREATE OR REPLACE FUNCTION increment_views(tool_id_input UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE tools
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = tool_id_input;
END;
$$;
