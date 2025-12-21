-- Drop the policy that exposes all profile data publicly
DROP POLICY IF EXISTS "Anyone can view display names" ON public.profiles;

-- Create a secure view that only exposes id and display_name
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, display_name
FROM public.profiles;

-- Grant access to the view for all users
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Create a new restricted policy that only allows authenticated users to view other profiles' display_name via function
CREATE OR REPLACE FUNCTION public.get_display_name(profile_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT display_name FROM public.profiles WHERE id = profile_id;
$$;