-- Create posts table for blog feature (IF NOT EXISTS to be idempotent)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_published BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "public_read_published_posts" ON public.posts;
DROP POLICY IF EXISTS "authenticated_insert_posts" ON public.posts;
DROP POLICY IF EXISTS "authenticated_update_posts" ON public.posts;
DROP POLICY IF EXISTS "authenticated_delete_posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can read published posts" ON public.posts;

-- Policy: Allow public read access for published posts
CREATE POLICY "public_read_published_posts"
  ON public.posts
  FOR SELECT
  USING (is_published = true);

-- Policy: Allow authenticated users to insert posts
CREATE POLICY "authenticated_insert_posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to update posts
CREATE POLICY "authenticated_update_posts"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to delete posts
CREATE POLICY "authenticated_delete_posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (true);
