-- Add features column to tools table as text array
ALTER TABLE public.tools 
ADD COLUMN features text[] DEFAULT '{}'::text[];