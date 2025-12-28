-- Admin users RPC to centralize access control and avoid direct client queries

-- Ensure helper is_admin() uses existing has_role() for clarity (already present but kept here for idempotency)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- RPC to fetch users for the admin panel with PII included, only for admins
CREATE OR REPLACE FUNCTION public.admin_get_users()
RETURNS TABLE(
  user_id uuid,
  email text,
  display_name text,
  created_at timestamptz,
  role public.app_role
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id AS user_id,
    pp.email,
    p.display_name,
    p.created_at,
    ur.role
  FROM public.profiles p
  LEFT JOIN public.private_profiles pp ON p.id = pp.id
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  WHERE public.is_admin()
  ORDER BY p.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_users() TO authenticated;