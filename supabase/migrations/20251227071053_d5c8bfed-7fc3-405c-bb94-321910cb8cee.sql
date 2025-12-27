-- reviews: تأكد RLS مفعّل
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- احذف سياسة القراءة العامة الحالية
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- المستخدم المسجل يقرأ مراجعاته فقط
CREATE POLICY "Authenticated can read own reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- إنشاء view عام للمراجعات بدون كشف user_id
CREATE OR REPLACE VIEW public.public_reviews AS
SELECT
  r.id,
  r.tool_id,
  r.rating,
  r.comment,
  r.created_at,
  encode(digest(r.user_id::text || '::nabd_salt_v1', 'sha256'), 'hex') AS reviewer_alias
FROM public.reviews r;

-- منح صلاحية القراءة للجميع
GRANT SELECT ON public.public_reviews TO anon, authenticated;