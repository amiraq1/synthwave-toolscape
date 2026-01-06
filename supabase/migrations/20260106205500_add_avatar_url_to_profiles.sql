-- Add avatar_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update RLS policies if necessary (usually existing policies cover updates)
-- Assuming users can update their own rows in profiles
