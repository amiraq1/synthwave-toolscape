-- Security hardening: prevent PII exposure & make public_reviews read-only

-- 1) private_profiles: remove broad admin-read policy (PII emails)
drop policy if exists "Admins can view all private profiles"
on public.private_profiles;

-- 2) profiles: remove admin panel broad select from client-side
drop policy if exists "Admins can view all profiles for management"
on public.profiles;

-- 3) user_roles: remove admin broad select policies (avoid role enumeration via client)
drop policy if exists "Admins can view all roles for management"
on public.user_roles;

drop policy if exists "Admins can view all roles"
on public.user_roles;

-- 4) public_reviews is a VIEW: enforce read-only at privilege level
revoke insert, update, delete on public.public_reviews from anon, authenticated;
grant select on public.public_reviews to anon, authenticated;
