-- Fix RPCs: drop first, then recreate with meal_plans & amenities returned

-- Drop existing functions (safe if not exist)
DROP FUNCTION IF EXISTS public.get_public_hotel(uuid);
DROP FUNCTION IF EXISTS public.get_public_hotels(boolean, uuid);

-- Recreate get_public_hotels with extended return columns
CREATE FUNCTION public.get_public_hotels(
  p_active_only boolean DEFAULT true,
  p_city_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name_ar text,
  name_en text,
  description_ar text,
  description_en text,
  location text,
  location_url text,
  city_id uuid,
  city_name_ar text,
  city_name_en text,
  price_per_night numeric,
  rating numeric,
  images jsonb,
  room_type public.room_type,
  tax_percentage numeric,
  total_rooms integer,
  active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  max_guests_per_room integer,
  extra_guest_price numeric,
  meal_plans jsonb,
  amenities jsonb,
  bed_type_double text
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    h.id,
    h.name_ar,
    h.name_en,
    COALESCE(h.description_ar, '') AS description_ar,
    COALESCE(h.description_en, '') AS description_en,
    COALESCE(h.location, '') AS location,
    COALESCE(h.location_url, '') AS location_url,
    h.city_id,
    c.name_ar AS city_name_ar,
    c.name_en AS city_name_en,
    h.price_per_night,
    COALESCE(h.rating, 0) AS rating,
    COALESCE(h.images, '[]'::jsonb) AS images,
    h.room_type,
    COALESCE(h.tax_percentage, 0) AS tax_percentage,
    COALESCE(h.total_rooms, 0) AS total_rooms,
    COALESCE(h.active, true) AS active,
    h.created_at,
    h.updated_at,
    COALESCE(h.max_guests_per_room, 2) AS max_guests_per_room,
    COALESCE(h.extra_guest_price, 0) AS extra_guest_price,
    COALESCE(h.meal_plans, '{}'::jsonb) AS meal_plans,
    COALESCE(h.amenities, '{}'::jsonb) AS amenities,
    h.bed_type_double
  FROM public.hotels h
  JOIN public.cities c ON c.id = h.city_id
  WHERE (p_city_id IS NULL OR h.city_id = p_city_id)
    AND (NOT p_active_only OR COALESCE(h.active, true) IS TRUE)
  ORDER BY h.created_at DESC, h.name_ar ASC;
$$;

-- Recreate get_public_hotel with extended return columns
CREATE FUNCTION public.get_public_hotel(
  p_hotel_id uuid
)
RETURNS TABLE (
  id uuid,
  name_ar text,
  name_en text,
  description_ar text,
  description_en text,
  location text,
  location_url text,
  city_id uuid,
  city_name_ar text,
  city_name_en text,
  price_per_night numeric,
  rating numeric,
  images jsonb,
  room_type public.room_type,
  tax_percentage numeric,
  total_rooms integer,
  active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  max_guests_per_room integer,
  extra_guest_price numeric,
  meal_plans jsonb,
  amenities jsonb,
  bed_type_double text
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    h.id,
    h.name_ar,
    h.name_en,
    COALESCE(h.description_ar, '') AS description_ar,
    COALESCE(h.description_en, '') AS description_en,
    COALESCE(h.location, '') AS location,
    COALESCE(h.location_url, '') AS location_url,
    h.city_id,
    c.name_ar AS city_name_ar,
    c.name_en AS city_name_en,
    h.price_per_night,
    COALESCE(h.rating, 0) AS rating,
    COALESCE(h.images, '[]'::jsonb) AS images,
    h.room_type,
    COALESCE(h.tax_percentage, 0) AS tax_percentage,
    COALESCE(h.total_rooms, 0) AS total_rooms,
    COALESCE(h.active, true) AS active,
    h.created_at,
    h.updated_at,
    COALESCE(h.max_guests_per_room, 2) AS max_guests_per_room,
    COALESCE(h.extra_guest_price, 0) AS extra_guest_price,
    COALESCE(h.meal_plans, '{}'::jsonb) AS meal_plans,
    COALESCE(h.amenities, '{}'::jsonb) AS amenities,
    h.bed_type_double
  FROM public.hotels h
  JOIN public.cities c ON c.id = h.city_id
  WHERE h.id = p_hotel_id;
$$;