-- Create function to fetch public reviews with reviewer name and avatar
-- Uses SECURITY DEFINER so callers can read through complex RLS safely

CREATE OR REPLACE FUNCTION public.get_public_reviews(tool_id_input BIGINT)
RETURNS TABLE (
  id uuid,
  rating int,
  comment text,
  created_at timestamptz,
  full_name text,
  avatar_url text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.rating,
    r.comment,
    r.created_at,
    COALESCE(p.display_name, '') AS full_name,
    (row_to_json(p)->>'avatar_url') AS avatar_url
  FROM public.reviews r
  LEFT JOIN public.profiles p ON r.user_id = p.id
  WHERE r.tool_id = tool_id_input
  ORDER BY r.created_at DESC;
END;
$$;

-- Grant execute to anonymous/authenticated roles so clients can call the function
GRANT EXECUTE ON FUNCTION public.get_public_reviews(BIGINT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_reviews(BIGINT) TO authenticated;
