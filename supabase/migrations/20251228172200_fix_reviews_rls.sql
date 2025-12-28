-- Allow public access to view all reviews
-- This is necessary so that visitors can see ratings and reviews for tools, not just their own.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'reviews' 
        AND policyname = 'Anyone can view reviews'
    ) THEN
        CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
    END IF;
END
$$;
