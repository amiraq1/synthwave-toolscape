-- ============================================
-- Migration: Fix Tools and Reviews Public Access
-- Date: 2026-01-07
-- Purpose: Ensure tools are publicly readable and RLS is properly configured
-- ============================================

-- 1. Ensure RLS is ENABLED but with proper policies
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can view tools" ON public.tools;
DROP POLICY IF EXISTS "Public read access" ON public.tools;
DROP POLICY IF EXISTS "Allow public read" ON public.tools;
DROP POLICY IF EXISTS "tools_public_read" ON public.tools;

-- 3. Create a simple, permissive SELECT policy for everyone
CREATE POLICY "tools_public_select"
ON public.tools
FOR SELECT
TO public
USING (true);

-- 4. Allow authenticated users to insert tools (for admin features)
DROP POLICY IF EXISTS "Authenticated users can insert tools" ON public.tools;
CREATE POLICY "tools_authenticated_insert"
ON public.tools
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Allow authenticated users to update tools
DROP POLICY IF EXISTS "Authenticated users can update tools" ON public.tools;
CREATE POLICY "tools_authenticated_update"
ON public.tools
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. Grant necessary permissions
GRANT SELECT ON public.tools TO anon;
GRANT SELECT ON public.tools TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tools TO authenticated;

-- 7. Ensure schema access
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 8. Fix sequence permissions for tool IDs
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 9. Also ensure reviews are publicly readable
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_public_select" ON public.reviews;
CREATE POLICY "reviews_public_select"
ON public.reviews
FOR SELECT
TO public
USING (true);

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT ON public.reviews TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;

-- 10. Log success
DO $$
BEGIN
  RAISE NOTICE 'Successfully configured RLS policies for tools and reviews tables';
END $$;
