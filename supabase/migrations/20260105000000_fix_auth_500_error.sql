-- Fix auth 500 triggers
-- Safe handle_new_user function that won't break auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Safe insert for profiles
  BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
     -- Log but don't fail the transaction
     RAISE WARNING 'Failed to create profile for user %: %', new.id, SQLERRM;
  END;

  -- Safe insert for private_profiles if table exists
  BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'private_profiles') THEN
      INSERT INTO public.private_profiles (id, email)
      VALUES (new.id, new.email)
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
    END IF;
  EXCEPTION WHEN OTHERS THEN
     RAISE WARNING 'Failed to create private_profile for user %: %', new.id, SQLERRM;
  END;

  RETURN new;
END;
$$;

-- Ensure trigger exists and is correct
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
