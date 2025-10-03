-- Fix 1: Remove the overly permissive public hotel viewing policy
DROP POLICY IF EXISTS "Anyone can view active hotels" ON public.hotels;

-- Create a more restrictive policy: authenticated users can view all hotels
CREATE POLICY "Authenticated users can view all hotels" 
ON public.hotels 
FOR SELECT 
TO authenticated
USING (true);

-- Create a security definer function for public access that excludes sensitive contact data
CREATE OR REPLACE FUNCTION public.get_public_hotels(
  p_city_id uuid DEFAULT NULL,
  p_active_only boolean DEFAULT true
)
RETURNS TABLE (
  id uuid,
  name_ar text,
  name_en text,
  description_ar text,
  description_en text,
  location text,
  city_id uuid,
  city_name_ar text,
  city_name_en text,
  price_per_night numeric,
  rating numeric,
  images jsonb,
  active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    h.id,
    h.name_ar,
    h.name_en,
    h.description_ar,
    h.description_en,
    h.location,
    h.city_id,
    c.name_ar as city_name_ar,
    c.name_en as city_name_en,
    h.price_per_night,
    h.rating,
    h.images,
    h.active,
    h.created_at,
    h.updated_at
  FROM public.hotels h
  LEFT JOIN public.cities c ON h.city_id = c.id
  WHERE (p_city_id IS NULL OR h.city_id = p_city_id)
    AND (NOT p_active_only OR h.active = true);
$$;

-- Create function for single hotel details (public safe version)
CREATE OR REPLACE FUNCTION public.get_public_hotel(p_hotel_id uuid)
RETURNS TABLE (
  id uuid,
  name_ar text,
  name_en text,
  description_ar text,
  description_en text,
  location text,
  city_id uuid,
  city_name_ar text,
  city_name_en text,
  price_per_night numeric,
  rating numeric,
  images jsonb,
  active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    h.id,
    h.name_ar,
    h.name_en,
    h.description_ar,
    h.description_en,
    h.location,
    h.city_id,
    c.name_ar as city_name_ar,
    c.name_en as city_name_en,
    h.price_per_night,
    h.rating,
    h.images,
    h.active,
    h.created_at,
    h.updated_at
  FROM public.hotels h
  LEFT JOIN public.cities c ON h.city_id = c.id
  WHERE h.id = p_hotel_id AND h.active = true;
$$;

-- Fix 2: Remove anonymous complaint viewing access
DROP POLICY IF EXISTS "Users can view their own complaints" ON public.complaints;

-- Create new policy that only allows users to view their exact complaints
CREATE POLICY "Users can view only their own complaints" 
ON public.complaints 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Note: Anonymous complaint submission is still allowed via the "Anonymous users can submit complaints" INSERT policy