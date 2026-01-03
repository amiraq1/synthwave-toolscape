-- ============================================
-- FIX RLS POLICIES FOR reviews TABLE
-- Enable Public Read Access for All Reviews
-- ============================================

-- 1. Drop existing SELECT policies to avoid conflicts
DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reviews;

-- 2. Create the correct Public Read Policy
-- This allows ANYONE (anon or authenticated) to see ALL reviews
CREATE POLICY "Public reviews are viewable by everyone" 
ON public.reviews FOR SELECT 
USING ( true );

-- 3. Ensure RLS is enabled
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. Verify INSERT/UPDATE/DELETE policies exist (recreate if missing)
-- INSERT: Only authenticated users can add reviews (user_id must match)
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reviews;
CREATE POLICY "Enable insert for authenticated users only"
ON public.reviews FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- UPDATE: Users can only update their own reviews
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.reviews;
CREATE POLICY "Enable update for users based on user_id"
ON public.reviews FOR UPDATE
USING ( auth.uid() = user_id );

-- DELETE: Users can only delete their own reviews
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.reviews;
CREATE POLICY "Enable delete for users based on user_id"
ON public.reviews FOR DELETE
USING ( auth.uid() = user_id );

-- Add helpful comment
COMMENT ON TABLE public.reviews IS 'User reviews with public read access and owner-restricted write access';
