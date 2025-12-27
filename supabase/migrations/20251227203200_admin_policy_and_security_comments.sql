-- Add security documentation comment to has_role function
-- The function must remain SECURITY DEFINER because:
-- 1. user_roles table has RLS that only allows users to see their own role
-- 2. The function needs to check roles for RLS policies on other tables
-- 3. Without DEFINER, policies using has_role() would fail
-- Security is maintained through: fixed search_path, parameterized inputs, boolean-only return

COMMENT ON FUNCTION public.has_role(_user_id uuid, _role app_role) IS 
'SECURITY DEFINER is intentional and required. This function checks user roles for RLS policies.
Security controls:
- SET search_path = public (prevents schema injection)
- Parameterized inputs only (no SQL injection)
- Returns boolean only (no data leakage)
- Simple EXISTS query with no dynamic SQL
DO NOT MODIFY without security review.';

-- Add security documentation to get_my_role function
COMMENT ON FUNCTION public.get_my_role() IS 
'SECURITY DEFINER is intentional and required. Returns only the current authenticated user role.
Security controls:
- Uses auth.uid() to ensure user can only see their own role
- SET search_path = public (prevents schema injection)
- Returns single role enum value only
DO NOT MODIFY without security review.';

-- Allow admins to view all profiles for user management
-- This policy enables the admin panel to show all users
CREATE POLICY "Admins can view all profiles for management"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));
