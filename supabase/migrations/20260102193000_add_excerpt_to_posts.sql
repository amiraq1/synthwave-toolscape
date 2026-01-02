-- Add excerpt column to posts table to fix schema cache error
-- This column is used for short summaries in the blog list

ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS excerpt text;

-- Add comment
COMMENT ON COLUMN public.posts.excerpt IS 'Short summary of the post content';
