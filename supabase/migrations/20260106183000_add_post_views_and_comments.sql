-- =============================================
-- إضافة عداد المشاهدات وجدول التعليقات للمقالات
-- =============================================

-- 1. إضافة عمود المشاهدات لجدول المقالات
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- 2. إنشاء جدول التعليقات
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON public.post_comments(created_at DESC);

-- 4. تفعيل RLS على جدول التعليقات
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- 5. سياسات الأمان للتعليقات
-- القراءة: الجميع يستطيع قراءة التعليقات
DROP POLICY IF EXISTS "Anyone can view post comments" ON public.post_comments;
CREATE POLICY "Anyone can view post comments"
ON public.post_comments FOR SELECT
USING (true);

-- الإضافة: المستخدمون المسجلون فقط
DROP POLICY IF EXISTS "Authenticated users can add comments" ON public.post_comments;
CREATE POLICY "Authenticated users can add comments"
ON public.post_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- التعديل: صاحب التعليق فقط
DROP POLICY IF EXISTS "Users can update own comments" ON public.post_comments;
CREATE POLICY "Users can update own comments"
ON public.post_comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- الحذف: صاحب التعليق أو المسؤول
DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
CREATE POLICY "Users can delete own comments"
ON public.post_comments FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 6. دالة لزيادة عدد المشاهدات
CREATE OR REPLACE FUNCTION public.increment_post_views(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.posts 
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_post_id;
END;
$$;

-- 7. منح الصلاحيات
GRANT EXECUTE ON FUNCTION public.increment_post_views(UUID) TO anon, authenticated;
GRANT SELECT ON public.post_comments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.post_comments TO authenticated;
