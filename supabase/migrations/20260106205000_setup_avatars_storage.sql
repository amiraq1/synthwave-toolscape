-- =============================================
-- Storage: Avatars Bucket Setup
-- =============================================

-- 1. Create the 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies
-- Note: Policies are created on storage.objects table

-- Drop existing policies to ensure idempotency
DROP POLICY IF EXISTS "Avatar Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Avatar User Upload" ON storage.objects;
DROP POLICY IF EXISTS "Avatar User Update" ON storage.objects;
DROP POLICY IF EXISTS "Avatar User Delete" ON storage.objects;

-- Policy: Everyone can view avatars (Public Read)
CREATE POLICY "Avatar Public Read"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Policy: Authenticated users can upload their own avatar
CREATE POLICY "Avatar User Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid() = owner
);

-- Policy: Users can update their own avatar
CREATE POLICY "Avatar User Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'avatars' AND auth.uid() = owner );

-- Policy: Users can delete their own avatar
CREATE POLICY "Avatar User Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'avatars' AND auth.uid() = owner );
