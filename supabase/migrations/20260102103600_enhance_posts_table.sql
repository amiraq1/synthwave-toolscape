-- ============================================
-- Enhance Posts Table with Additional Fields
-- Adds: slug, excerpt, author_id
-- ============================================

-- Add new columns if they don't exist
DO $$
BEGIN
  -- Add slug column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'slug') THEN
    ALTER TABLE public.posts ADD COLUMN slug TEXT UNIQUE;
  END IF;
  
  -- Add excerpt column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'excerpt') THEN
    ALTER TABLE public.posts ADD COLUMN excerpt TEXT;
  END IF;
  
  -- Add author_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'posts' AND column_name = 'author_id') THEN
    ALTER TABLE public.posts ADD COLUMN author_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);

-- Create index on author_id for filtering by author
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);

-- Update existing posts to have auto-generated slugs if null
UPDATE public.posts 
SET slug = LOWER(REPLACE(REPLACE(title, ' ', '-'), '.', '')) || '-' || SUBSTRING(id::text, 1, 8)
WHERE slug IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.posts.slug IS 'SEO-friendly URL slug for the post';
COMMENT ON COLUMN public.posts.excerpt IS 'Short summary/preview of the post content';
COMMENT ON COLUMN public.posts.author_id IS 'User ID of the post author';
