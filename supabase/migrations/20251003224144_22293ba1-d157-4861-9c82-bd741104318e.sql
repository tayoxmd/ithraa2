-- Add policy to allow anyone (authenticated or not) to view active hotels
CREATE POLICY "Anyone can view active hotels" 
ON public.hotels 
FOR SELECT 
USING (active = true);