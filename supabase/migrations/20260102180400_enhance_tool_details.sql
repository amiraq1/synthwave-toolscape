-- Add enhancement fields to tools table
-- video_url: for YouTube embed links
-- faqs: JSONB array for Questions & Answers [{question: "...", answer: "..."}]
-- alternatives: Array of Tool IDs that are good alternatives
-- screenshots: Array of image URLs for the gallery

ALTER TABLE public.tools 
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS alternatives bigint[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS screenshots text[] DEFAULT '{}';

-- Add comments for clarity
COMMENT ON COLUMN public.tools.video_url IS 'YouTube Embed URL e.g., https://www.youtube.com/embed/...';
COMMENT ON COLUMN public.tools.faqs IS 'Array of FAQ objects: [{"question": "...", "answer": "..."}]';
COMMENT ON COLUMN public.tools.alternatives IS 'Array of Tool IDs representing alternative software';
COMMENT ON COLUMN public.tools.screenshots IS 'Array of screenshot URLs';
