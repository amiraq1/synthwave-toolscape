-- Fix: Add public read access to reviews table
-- This allows the public_reviews view (which uses security_invoker) to work properly

-- Drop the restrictive authenticated-only policy
DROP POLICY IF EXISTS "Authenticated can read own reviews" ON public.reviews;

-- Create a policy that allows anyone to READ reviews (for public display)
CREATE POLICY "Anyone can view reviews" 
ON public.reviews 
FOR SELECT 
USING (true);

-- Keep existing policies for write operations (INSERT/UPDATE/DELETE require ownership)
-- These already exist and are correct