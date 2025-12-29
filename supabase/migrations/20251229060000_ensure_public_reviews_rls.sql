-- =============================================================================
-- Ensure RLS Protection for public_reviews
-- Date: 2025-12-29
-- Purpose: Final security audit to ensure complete RLS protection
-- =============================================================================

-- 1) Ensure RLS is enabled on reviews table (the underlying table)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews FORCE ROW LEVEL SECURITY;

-- 2) Drop and recreate policies to ensure clean state
DROP POLICY IF EXISTS "reviews_select_public" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_authenticated" ON public.reviews;
DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
DROP POLICY IF EXISTS "reviews_delete_own" ON public.reviews;

-- 3) Create secure RLS policies
-- SELECT: Public read access (needed for displaying reviews)
CREATE POLICY "reviews_select_public"
ON public.reviews FOR SELECT
USING (true);

-- INSERT: Only authenticated users, must match their own user_id
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

-- 4) Recreate public_reviews VIEW with SECURITY INVOKER
-- This ensures the VIEW respects RLS on the underlying reviews table
CREATE OR REPLACE VIEW public.public_reviews
WITH (security_invoker = true)
AS
SELECT
  r.id,
  r.tool_id,
  r.rating,
  r.comment,
  r.created_at,
  encode(digest(r.user_id::text || '::nabd_salt_v1', 'sha256'), 'hex') AS reviewer_alias
FROM public.reviews r;

-- 5) Strictly limit privileges on public_reviews VIEW (read-only)
REVOKE ALL ON public.public_reviews FROM anon, authenticated;
GRANT SELECT ON public.public_reviews TO anon, authenticated;

-- 6) Security documentation
COMMENT ON VIEW public.public_reviews IS 
'Secure read-only VIEW for reviews:
- No direct INSERT/UPDATE/DELETE allowed
- Uses SECURITY INVOKER to respect RLS on reviews table
- Hides user_id PII, exposes hashed reviewer_alias instead';
