-- Add screenshots column to tools table for multiple image URLs
ALTER TABLE public.tools
ADD COLUMN IF NOT EXISTS screenshots text[] DEFAULT '{}'::text[];

-- No RLS changes needed; tools is already public-read.
