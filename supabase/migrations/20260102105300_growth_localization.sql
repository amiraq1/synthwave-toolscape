-- ============================================
-- Growth & Localization Features
-- Arabic Support, Coupons, Newsletter
-- ============================================

-- 1) Add localization and deal columns to tools table
DO $$
BEGIN
  -- Add supports_arabic column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'tools' AND column_name = 'supports_arabic') THEN
    ALTER TABLE public.tools ADD COLUMN supports_arabic BOOLEAN NOT NULL DEFAULT false;
  END IF;
  
  -- Add coupon_code column for partnership deals
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'tools' AND column_name = 'coupon_code') THEN
    ALTER TABLE public.tools ADD COLUMN coupon_code TEXT;
  END IF;
  
  -- Add deal_expiry column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'tools' AND column_name = 'deal_expiry') THEN
    ALTER TABLE public.tools ADD COLUMN deal_expiry TIMESTAMPTZ;
  END IF;
END $$;

-- Create index for Arabic-supporting tools filtering
CREATE INDEX IF NOT EXISTS idx_tools_supports_arabic ON public.tools(supports_arabic) WHERE supports_arabic = true;

-- Add comments
COMMENT ON COLUMN public.tools.supports_arabic IS 'Whether the tool has Arabic language support';
COMMENT ON COLUMN public.tools.coupon_code IS 'Exclusive partnership coupon/discount code';
COMMENT ON COLUMN public.tools.deal_expiry IS 'When the coupon/deal expires (null = permanent)';

-- ============================================
-- 2) Create Newsletter Subscribers Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  source TEXT DEFAULT 'website' -- Track subscription source
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON public.subscribers(created_at);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can subscribe (insert)
CREATE POLICY "anyone_can_subscribe"
  ON public.subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only admins can view subscribers
CREATE POLICY "admins_view_subscribers"
  ON public.subscribers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can delete subscribers
CREATE POLICY "admins_delete_subscribers"
  ON public.subscribers
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Add comment
COMMENT ON TABLE public.subscribers IS 'Newsletter email subscribers. Public can insert, only admins can read/delete.';
