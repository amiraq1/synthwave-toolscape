-- SQL script to update Midjourney icon to a high-quality SVG
-- Run this in your Supabase Dashboard -> SQL Editor

UPDATE public.tools
SET image_url = 'https://cdn.simpleicons.org/midjourney/white'
WHERE title = 'Midjourney' OR url = 'https://midjourney.com';

-- Verify the change
SELECT id, title, image_url FROM public.tools WHERE title = 'Midjourney';
