-- Create table for bookmarking posts
CREATE TABLE IF NOT EXISTS public.post_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user_id ON public.post_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_post_bookmarks_post_id ON public.post_bookmarks(post_id);

-- Enable RLS and policies
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_post_bookmarks" ON public.post_bookmarks;
CREATE POLICY "users_select_own_post_bookmarks"
  ON public.post_bookmarks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_insert_own_post_bookmarks" ON public.post_bookmarks;
CREATE POLICY "users_insert_own_post_bookmarks"
  ON public.post_bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_delete_own_post_bookmarks" ON public.post_bookmarks;
CREATE POLICY "users_delete_own_post_bookmarks"
  ON public.post_bookmarks
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

COMMENT ON TABLE public.post_bookmarks IS 'User bookmarks for blog posts';
