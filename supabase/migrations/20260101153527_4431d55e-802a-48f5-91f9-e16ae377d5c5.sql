-- إنشاء bucket للقطات الشاشة
INSERT INTO storage.buckets (id, name, public)
VALUES ('tool-screenshots', 'tool-screenshots', true);

-- السماح للجميع بقراءة الصور
CREATE POLICY "Public can view screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'tool-screenshots');

-- السماح للمستخدمين المصادق عليهم برفع الصور
CREATE POLICY "Authenticated users can upload screenshots"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tool-screenshots' 
  AND auth.uid() IS NOT NULL
);

-- السماح للـ admins بحذف الصور
CREATE POLICY "Admins can delete screenshots"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tool-screenshots'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);