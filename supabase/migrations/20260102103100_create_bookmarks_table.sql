-- ============================================
-- Bookmarks Table for User Favorites
-- ============================================

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id BIGINT NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Prevent duplicate bookmarks
  UNIQUE(user_id, tool_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_tool_id ON public.bookmarks(tool_id);

-- Enable Row Level Security
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookmarks
CREATE POLICY "users_select_own_bookmarks"
  ON public.bookmarks
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can insert their own bookmarks
CREATE POLICY "users_insert_own_bookmarks"
  ON public.bookmarks
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own bookmarks
CREATE POLICY "users_delete_own_bookmarks"
  ON public.bookmarks
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add comment for documentation
COMMENT ON TABLE public.bookmarks IS 'User bookmarks/favorites for tools. Each user can bookmark tools for quick access.';
