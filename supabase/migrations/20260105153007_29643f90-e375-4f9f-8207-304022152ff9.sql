-- Fix: Ensure private_profiles is NOT accessible to anonymous users
-- Drop any existing policies that might allow anonymous access
DROP POLICY IF EXISTS "Private: owner can read" ON public.private_profiles;
DROP POLICY IF EXISTS "Private: owner can update" ON public.private_profiles;
DROP POLICY IF EXISTS "Admins can view all private profiles" ON public.private_profiles;

-- Recreate policies with explicit authenticated user requirement
CREATE POLICY "Owner can read own private profile"
ON public.private_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Owner can update own private profile"
ON public.private_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all private profiles"
ON public.private_profiles
FOR SELECT
TO authenticated
USING (public.is_admin());