-- Enable RLS on public_reviews view with security_invoker
-- This ensures the view respects RLS policies of underlying tables

-- First, drop and recreate the view with security_invoker = true
DROP VIEW IF EXISTS public.public_reviews;

CREATE VIEW public.public_reviews 
WITH (security_invoker = true)
AS
SELECT 
    r.id,
    r.tool_id,
    r.rating,
    r.comment,
    r.created_at,
    COALESCE(p.display_name, 'Anonymous') as reviewer_alias
FROM public.reviews r
LEFT JOIN public.profiles p ON r.user_id = p.id;

-- Grant select to public (anon and authenticated) - the view already filters out user_id
GRANT SELECT ON public.public_reviews TO anon;
GRANT SELECT ON public.public_reviews TO authenticated;