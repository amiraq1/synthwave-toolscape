-- Create secure blog posts table with proper RLS

-- 1) Create posts table if it does not exist yet
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_published boolean NOT NULL DEFAULT true,
  author_id uuid NOT NULL
);

-- 2) Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 3) Clean up any legacy permissive policies if they exist
DROP POLICY IF EXISTS "authenticated_insert_posts" ON public.posts;
DROP POLICY IF EXISTS "authenticated_update_posts" ON public.posts;
DROP POLICY IF EXISTS "authenticated_delete_posts" ON public.posts;

-- 4) Public can read only published posts
CREATE POLICY "Anyone can read published posts" ON public.posts
  FOR SELECT
  USING (is_published = true);

-- 5) Only owners (or admins) can write
CREATE POLICY "authors_insert_posts" ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "authors_update_own_posts" ON public.posts
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "authors_delete_own_posts" ON public.posts
  FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR has_role(auth.uid(), 'admin'));
