-- ============================================
-- FIX RLS POLICIES FOR reviews TABLE
-- Note: public_reviews is a VIEW, RLS applies to the base table
-- ============================================

-- First, drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reviews;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.reviews;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.reviews;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.reviews;
DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

-- Ensure RLS is enabled on the reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 1. Allow Public Read Access
-- Anyone (anon and authenticated) can SELECT rows
CREATE POLICY "Enable read access for all users"
ON public.reviews FOR SELECT
USING ( true );

-- 2. Allow Authenticated Insert
-- Logged-in users can INSERT rows (user_id must match their auth.uid())
CREATE POLICY "Enable insert for authenticated users only"
ON public.reviews FOR INSERT
WITH CHECK ( auth.uid() = user_id );

-- 3. Allow Update for Review Owner
-- Users can only UPDATE their own reviews
CREATE POLICY "Enable update for users based on user_id"
ON public.reviews FOR UPDATE
USING ( auth.uid() = user_id );

-- 4. Allow Delete for Review Owner
-- Users can only DELETE their own reviews
CREATE POLICY "Enable delete for users based on user_id"
ON public.reviews FOR DELETE
USING ( auth.uid() = user_id );

-- Add comment for documentation
COMMENT ON TABLE public.reviews IS 'User reviews with RLS policies for secure access control';
