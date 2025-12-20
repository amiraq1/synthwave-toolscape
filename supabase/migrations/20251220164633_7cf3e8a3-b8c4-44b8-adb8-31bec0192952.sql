-- Create storage bucket for tool logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('tool-logos', 'tool-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view logos (public bucket)
CREATE POLICY "Anyone can view tool logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'tool-logos');

-- Allow authenticated users to upload logos
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'tool-logos' AND auth.uid() IS NOT NULL);

-- Allow admins to update logos
CREATE POLICY "Admins can update logos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'tool-logos' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to delete logos
CREATE POLICY "Admins can delete logos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'tool-logos' AND public.has_role(auth.uid(), 'admin'));