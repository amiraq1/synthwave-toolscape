-- Fix admin RPC 400 errors caused by overloaded has_role(uuid, text)
-- and harden admin_get_users to return a single role per user.

-- Remove ambiguous overload if it exists.
DROP FUNCTION IF EXISTS public.has_role(uuid, text);

-- Canonical role check function.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- Explicit enum cast avoids unknown/text resolution issues.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(public.has_role(auth.uid(), 'admin'::public.app_role), false);
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Admin users listing RPC used by AdminUsersTable.
-- Uses explicit EXISTS check (no dependency on potentially stale helper SQL).
-- Picks a single role by precedence to avoid duplicate user rows.
DROP FUNCTION IF EXISTS public.admin_get_users();

CREATE FUNCTION public.admin_get_users()
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
SET search_path = public, pg_temp
AS $$
  SELECT
    p.id AS user_id,
    pp.email,
    p.display_name,
    p.created_at,
    ur.role
  FROM public.profiles p
  LEFT JOIN public.private_profiles pp
    ON pp.id = p.id
  LEFT JOIN LATERAL (
    SELECT ur2.role
    FROM public.user_roles ur2
    WHERE ur2.user_id = p.id
    ORDER BY
      CASE ur2.role
        WHEN 'admin'::public.app_role THEN 1
        WHEN 'moderator'::public.app_role THEN 2
        ELSE 3
      END
    LIMIT 1
  ) ur
    ON TRUE
  WHERE EXISTS (
    SELECT 1
    FROM public.user_roles admin_ur
    WHERE admin_ur.user_id = auth.uid()
      AND admin_ur.role = 'admin'::public.app_role
  )
  ORDER BY p.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_users() TO authenticated;

-- Rebind user_roles admin policies to canonical has_role(app_role)
-- so admin upsert/delete from client does not depend on JWT app_metadata.
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
