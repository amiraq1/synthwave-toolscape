
-- SQL Script to grant admin privileges to amaralmdarking27@gmail.com
-- execute this in your Supabase SQL Editor

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Retrieve the user ID from auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'amaralmdarking27@gmail.com';

  -- If user exists, proceed
  IF v_user_id IS NOT NULL THEN
    RAISE NOTICE 'User found with ID: %', v_user_id;

    -- 1. Insert or Update into user_roles table
    -- Corrected: Removed updated_at as it does not exist in the schema
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE
    SET role = 'admin';

    RAISE NOTICE 'Updated user_roles for user.';

    -- 2. Update profiles table (Safe update)
    -- We try to update table if it has the role column
    BEGIN
        UPDATE public.profiles
        SET role = 'admin'
        WHERE id = v_user_id;
        
        RAISE NOTICE 'Updated profiles.role for user.';
    EXCEPTION WHEN undefined_column THEN
        RAISE NOTICE 'Column "role" does not exist in public.profiles. Skipping profile update.';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating profiles: %. Continuing...', SQLERRM;
    END;

  ELSE
    RAISE NOTICE 'User with email amaralmdarking27@gmail.com not found in auth.users.';
  END IF;
END $$;
