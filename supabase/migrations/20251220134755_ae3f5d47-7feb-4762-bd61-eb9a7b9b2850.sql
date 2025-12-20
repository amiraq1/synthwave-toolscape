-- Allow anyone to insert tools (public directory)
CREATE POLICY "Anyone can add tools" 
ON public.tools 
FOR INSERT 
WITH CHECK (true);