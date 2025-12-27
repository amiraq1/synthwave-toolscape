ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_one_role_per_user UNIQUE (user_id);