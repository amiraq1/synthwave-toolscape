-- Ensure public_reviews view runs with SECURITY INVOKER semantics
CREATE OR REPLACE VIEW public.public_reviews
WITH (security_invoker = true)
AS
SELECT
  r.id,
  r.tool_id,
  r.rating,
  r.comment,
  r.created_at,
  md5(r.user_id::text || '::nabd_salt_v1') AS reviewer_alias
FROM public.reviews r;