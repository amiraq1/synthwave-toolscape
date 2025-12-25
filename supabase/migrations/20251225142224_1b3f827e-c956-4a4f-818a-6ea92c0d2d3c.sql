-- Allow admins to view all roles for user management
-- This is secure because only verified admins can access this
CREATE POLICY "Admins can view all roles for management"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));