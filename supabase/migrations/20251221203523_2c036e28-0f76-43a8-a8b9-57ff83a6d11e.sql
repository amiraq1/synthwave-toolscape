-- Drop the security definer view as it's not needed
DROP VIEW IF EXISTS public.public_profiles;

-- The get_display_name function is sufficient for getting display names safely