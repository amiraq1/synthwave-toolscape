
-- Complete Fix Script for Admin Access
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    v_user_id UUID;
    v_has_role BOOLEAN;
    v_role_exists BOOLEAN;
BEGIN
    -- 1. Get User ID
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'amaralmdarking27@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found!';
    END IF;

    RAISE NOTICE 'Target User ID: %', v_user_id;

    -- 2. Fix user_roles (Delete and Re-insert to be sure)
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin');
    
    RAISE NOTICE 'Inserted admin role into user_roles.';

    -- 3. Check and Fix profiles table (Add role column if missing)
    -- Many policies rely on profiles.role, so we must ensure it exists and is synced
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) INTO v_role_exists;

    IF NOT v_role_exists THEN
        RAISE NOTICE 'Adding missing column "role" to profiles table...';
        ALTER TABLE public.profiles ADD COLUMN role public.app_role DEFAULT 'user';
    END IF;

    -- Update the profile role to admin
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Synced profiles.role to admin.';

    -- 4. Verify functionality
    SELECT public.has_role(v_user_id, 'admin') INTO v_has_role;
    
    IF v_has_role THEN
        RAISE NOTICE 'SUCCESS: public.has_role() returns TRUE. User is now Admin.';
    ELSE
        RAISE NOTICE 'WARNING: public.has_role() returned FALSE despite insert. Check triggers or RLS.';
    END IF;

END $$;
