-- ============================================
-- Sponsored Listings Monetization Feature
-- Adds: is_sponsored, sponsor_expiry
-- ============================================

-- Add sponsored columns to tools table
DO $$
BEGIN
  -- Add is_sponsored column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'tools' AND column_name = 'is_sponsored') THEN
    ALTER TABLE public.tools ADD COLUMN is_sponsored BOOLEAN NOT NULL DEFAULT false;
  END IF;
  
  -- Add sponsor_expiry column for auto-expiration
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'tools' AND column_name = 'sponsor_expiry') THEN
    ALTER TABLE public.tools ADD COLUMN sponsor_expiry TIMESTAMPTZ;
  END IF;
END $$;

-- Create index for fast sponsored tool queries
CREATE INDEX IF NOT EXISTS idx_tools_is_sponsored ON public.tools(is_sponsored) WHERE is_sponsored = true;

-- Create index for expiry date queries (for cleanup jobs)
CREATE INDEX IF NOT EXISTS idx_tools_sponsor_expiry ON public.tools(sponsor_expiry) WHERE sponsor_expiry IS NOT NULL;

-- Add helpful comments
COMMENT ON COLUMN public.tools.is_sponsored IS 'Whether this tool is a paid sponsored listing that appears at the top';
COMMENT ON COLUMN public.tools.sponsor_expiry IS 'When the sponsorship expires (null = permanent until manually removed)';

-- Create a function to auto-expire sponsorships (can be called via cron job)
CREATE OR REPLACE FUNCTION expire_sponsorships()
RETURNS void AS $$
BEGIN
  UPDATE public.tools
  SET is_sponsored = false
  WHERE is_sponsored = true 
    AND sponsor_expiry IS NOT NULL 
    AND sponsor_expiry < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to service_role for cron jobs
GRANT EXECUTE ON FUNCTION expire_sponsorships() TO service_role;
