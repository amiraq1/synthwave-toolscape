-- Execute this in the SQL Editor of your CURRENTLY ACTIVE Supabase project
-- (The one your app is connected to)

-- 1. Add the missing column
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS excerpt text;

-- 2. Force PostgREST to refresh its schema cache immediately
-- This fixes the "Could not find ... in the schema cache" error
NOTIFY pgrst, 'reload schema';
