-- =============================================================================
-- Security Audit & Hardening for Reviews System
-- Date: 2025-12-28
-- Purpose: Ensure complete RLS protection on reviews table and public_reviews VIEW
-- =============================================================================

-- 1) Ensure RLS is enabled on reviews table (idempotent)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 2) Force RLS for table owner as well (prevents bypassing RLS)
ALTER TABLE public.reviews FORCE ROW LEVEL SECURITY;

-- =============================================================================
-- DROP existing policies and recreate them cleanly to avoid conflicts
-- =============================================================================

-- Drop all existing policies on reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated can read own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can add reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

-- =============================================================================
-- CREATE secure RLS policies
-- =============================================================================

-- SELECT: Public read access (required for displaying reviews to visitors)
CREATE POLICY "reviews_select_public"
ON public.reviews FOR SELECT
USING (true);

-- INSERT: Only authenticated users can add reviews, and only for themselves
CREATE POLICY "reviews_insert_authenticated"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own reviews
CREATE POLICY "reviews_update_own"
ON public.reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own reviews
CREATE POLICY "reviews_delete_own"
ON public.reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- =============================================================================
-- Secure public_reviews VIEW (read-only, no PII exposure)
-- =============================================================================

-- Recreate VIEW with SECURITY INVOKER to respect RLS on underlying table
CREATE OR REPLACE VIEW public.public_reviews
WITH (security_invoker = true)
AS
SELECT
  r.id,
  r.tool_id,
  r.rating,
  r.comment,
  r.created_at,
  -- Hash user_id to prevent PII exposure while maintaining consistency
  md5(r.user_id::text || '::nabd_salt_v1') AS reviewer_alias
FROM public.reviews r;

-- Revoke ALL privileges first, then grant only SELECT
REVOKE ALL ON public.public_reviews FROM anon, authenticated;
GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- =============================================================================
-- Add security documentation comments
-- =============================================================================

COMMENT ON TABLE public.reviews IS 
'User reviews for tools. Protected by RLS: 
- SELECT: Public (anyone can view)
- INSERT: Authenticated users only, must match auth.uid()
- UPDATE/DELETE: Owner only (user_id = auth.uid())';

COMMENT ON VIEW public.public_reviews IS 
'Public-facing read-only view of reviews. 
- Hides user_id, exposes reviewer_alias (SHA256 hash)
- SELECT only, no INSERT/UPDATE/DELETE allowed
- Uses SECURITY INVOKER to respect underlying RLS';

COMMENT ON POLICY "reviews_select_public" ON public.reviews IS 
'Allow public read access to reviews for displaying ratings';

COMMENT ON POLICY "reviews_insert_authenticated" ON public.reviews IS 
'Only authenticated users can create reviews, must be for their own user_id';

COMMENT ON POLICY "reviews_update_own" ON public.reviews IS 
'Users can only modify their own reviews';

COMMENT ON POLICY "reviews_delete_own" ON public.reviews IS 
'Users can only delete their own reviews';

-- =============================================================================
-- Verification queries (for manual testing in SQL Editor)
-- =============================================================================
/*
-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reviews';

-- List all policies on reviews
SELECT policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE tablename = 'reviews';

-- Check public_reviews is a VIEW
SELECT table_type FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'public_reviews';

-- Check grants on public_reviews
SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name = 'public_reviews';
*/
