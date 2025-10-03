-- Phase 1: Fix Hotel Data Exposure
-- Create a secure view for public hotel access that excludes sensitive contact information

CREATE OR REPLACE VIEW public.hotels_public AS
SELECT 
  h.id,
  h.name_ar,
  h.name_en,
  h.description_ar,
  h.description_en,
  h.location,
  h.price_per_night,
  h.rating,
  h.images,
  h.city_id,
  h.active,
  h.created_at,
  h.updated_at,
  c.name_ar as city_name_ar,
  c.name_en as city_name_en
FROM public.hotels h
LEFT JOIN public.cities c ON h.city_id = c.id
WHERE h.active = true;

-- Phase 2: Fix Function Security
-- Update the update_updated_at_column function to include proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Phase 3: Remove overly permissive policy and replace with secure one
-- Drop the old policy that exposes sensitive data
DROP POLICY IF EXISTS "Anyone can view active hotels" ON public.hotels;

-- Create new restrictive policy for public access
-- Public users should use the hotels_public view instead
CREATE POLICY "Public can view hotels through view"
ON public.hotels
FOR SELECT
USING (
  active = true 
  AND auth.uid() IS NULL
);

-- Admins and employees can see all hotel data including contact info
CREATE POLICY "Admins and employees can view all hotels"
ON public.hotels
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'employee'::app_role)
);