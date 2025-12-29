-- Add documentation comment to has_role() explaining SECURITY DEFINER usage and security expectations
COMMENT ON FUNCTION public.has_role(uuid, public.app_role)
IS 'SECURITY DEFINER is required so RLS policies can check roles without recursion. Function must remain read-only, use fixed search_path, avoid dynamic SQL, and never perform INSERT/UPDATE/DELETE to prevent privilege escalation.';