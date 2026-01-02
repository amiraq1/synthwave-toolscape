-- Create a new public bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog_images', 'blog_images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Allow Public Read Access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'blog_images' );

-- Policy 2: Allow Authenticated Users to Upload
-- (We restrict to authenticated users as a basic security measure)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'blog_images' AND auth.role() = 'authenticated' );

-- Policy 3: Allow Users to Update/Delete their own files (optional but good practice)
CREATE POLICY "Owner Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'blog_images' AND auth.uid() = owner );

CREATE POLICY "Owner Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'blog_images' AND auth.uid() = owner );
