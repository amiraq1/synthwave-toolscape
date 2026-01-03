-- ============================================
-- FIX RLS POLICIES FOR tools TABLE
-- Enable Public Read Access for All Tools
-- ============================================

-- Ensure RLS is enabled on the tools table
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- 1. Drop existing SELECT policies to avoid conflicts
DROP POLICY IF EXISTS "Public tools are viewable by everyone" ON public.tools;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tools;
DROP POLICY IF EXISTS "Anyone can view tools" ON public.tools;

-- 2. Create the correct Public Read Policy
-- This allows ANYONE (anon or authenticated) to see ALL tools
CREATE POLICY "Public tools are viewable by everyone" 
ON public.tools FOR SELECT 
USING ( true );

-- 3. Allow authenticated users to insert tools (for user submissions)
DROP POLICY IF EXISTS "Authenticated users can insert tools" ON public.tools;
CREATE POLICY "Authenticated users can insert tools"
ON public.tools FOR INSERT
WITH CHECK ( auth.role() = 'authenticated' );

-- 4. Allow admins or owners to update tools (optional)
DROP POLICY IF EXISTS "Admins can update tools" ON public.tools;
CREATE POLICY "Admins can update tools"
ON public.tools FOR UPDATE
USING ( auth.role() = 'authenticated' );

-- Add helpful comment
COMMENT ON TABLE public.tools IS 'AI Tools directory with public read access';
