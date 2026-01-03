-- ============================================
-- EMERGENCY FIX: Force Enable Public Read for tools
-- ============================================

-- Remove ALL existing policies first
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'tools'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.tools', policy_record.policyname);
    END LOOP;
END $$;

-- Make absolutely sure RLS is enabled
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Create a guaranteed public read policy
CREATE POLICY "anon_can_read_tools" 
ON public.tools 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Also create a general fallback
CREATE POLICY "public_read_all_tools" 
ON public.tools 
FOR SELECT 
USING (true);

-- Grant explicit permissions
GRANT SELECT ON public.tools TO anon;
GRANT SELECT ON public.tools TO authenticated;
