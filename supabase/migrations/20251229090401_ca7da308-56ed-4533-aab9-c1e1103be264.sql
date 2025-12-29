-- Restrict writes on tool-logos bucket to admins only while keeping public read access

-- 1) Drop existing policies related to tool-logos bucket if they exist
DROP POLICY IF EXISTS "Anyone can view tool logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete logos" ON storage.objects;

-- 2) Recreate policies with admin-only writes

-- Public read access to tool logos (no auth required)
CREATE POLICY "Anyone can view tool logos"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'tool-logos'
);

-- Admins can upload logos
CREATE POLICY "Admins can upload logos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'tool-logos'
  AND has_role(auth.uid(), 'admin'::public.app_role)
);

-- Admins can update logos
CREATE POLICY "Admins can update logos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'tool-logos'
  AND has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'tool-logos'
  AND has_role(auth.uid(), 'admin'::public.app_role)
);

-- Admins can delete logos
CREATE POLICY "Admins can delete logos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'tool-logos'
  AND has_role(auth.uid(), 'admin'::public.app_role)
);