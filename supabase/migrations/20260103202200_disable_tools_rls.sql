-- ============================================
-- NUCLEAR OPTION: Disable RLS completely on tools
-- This is to diagnose if RLS is the problem
-- ============================================

-- Completely disable RLS on tools table
ALTER TABLE public.tools DISABLE ROW LEVEL SECURITY;

-- Grant all necessary permissions explicitly
GRANT ALL ON public.tools TO anon;
GRANT ALL ON public.tools TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Also grant on sequences if any
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
