-- 1. Add role column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Make specific user admin (using the known admin email)
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'amaralmdarking27@gmail.com';

-- 3. Update security policies (allow admins to update roles)
CREATE POLICY "Admins can update roles" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);
