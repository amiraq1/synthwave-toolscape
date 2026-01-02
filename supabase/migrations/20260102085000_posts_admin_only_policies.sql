-- ============================================
-- Update RLS Policies for Posts Table
-- Restrict INSERT, UPDATE, DELETE to Admins only
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "authenticated_insert_posts" ON public.posts;
DROP POLICY IF EXISTS "authenticated_update_posts" ON public.posts;
DROP POLICY IF EXISTS "authenticated_delete_posts" ON public.posts;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Allow only admins to insert posts
CREATE POLICY "admin_insert_posts"
  ON public.posts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Policy: Allow only admins to update posts
CREATE POLICY "admin_update_posts"
  ON public.posts
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Policy: Allow only admins to delete posts
CREATE POLICY "admin_delete_posts"
  ON public.posts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
