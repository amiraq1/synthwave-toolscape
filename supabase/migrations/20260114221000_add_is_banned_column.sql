-- Add is_banned column and enhance role security
-- Migration: 20260114221000_add_is_banned_column.sql

-- 1. Add CHECK constraint to role column (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- 2. Add is_banned column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- 3. Create index on is_banned for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles(is_banned) WHERE is_banned = true;

-- 4. Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can update user roles" ON public.profiles;

-- 5. Create policy: Only admins can update role and is_banned columns
-- This policy allows admins to update ANY profile
CREATE POLICY "Admins can update user roles and ban status"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  -- Check if the current user is an admin
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  -- Admins can update any profile
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. Add comment for documentation
COMMENT ON COLUMN public.profiles.is_banned IS 'Whether the user is banned from the platform';
COMMENT ON COLUMN public.profiles.role IS 'User role: user or admin';
