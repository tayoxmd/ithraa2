-- Delete ALL versions explicitly with full signatures
DROP FUNCTION IF EXISTS public.get_public_hotels(p_active_only boolean, p_city_id uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_public_hotels(p_city_id uuid, p_active_only boolean) CASCADE;

-- Create single version
CREATE FUNCTION public.get_public_hotels(
  p_city_id uuid DEFAULT NULL,
  p_active_only boolean DEFAULT true
)
RETURNS TABLE (
  id uuid, name_ar text, name_en text, description_ar text, description_en text,
  location text, location_url text, city_id uuid, city_name_ar text, city_name_en text,
  price_per_night numeric, rating numeric, images jsonb, room_type public.room_type,
  tax_percentage numeric, total_rooms integer, active boolean, created_at timestamptz,
  updated_at timestamptz, max_guests_per_room integer, extra_guest_price numeric,
  meal_plans jsonb, amenities jsonb, bed_type_double text
)
LANGUAGE sql STABLE AS $$
  SELECT h.id, h.name_ar, h.name_en, COALESCE(h.description_ar,''), COALESCE(h.description_en,''),
         COALESCE(h.location,''), COALESCE(h.location_url,''), h.city_id, c.name_ar, c.name_en,
         h.price_per_night, COALESCE(h.rating,0), COALESCE(h.images,'[]'::jsonb), h.room_type,
         COALESCE(h.tax_percentage,0), COALESCE(h.total_rooms,0), COALESCE(h.active,true),
         h.created_at, h.updated_at, COALESCE(h.max_guests_per_room,2), COALESCE(h.extra_guest_price,0),
         COALESCE(h.meal_plans,'{}'::jsonb), COALESCE(h.amenities,'{}'::jsonb), h.bed_type_double
  FROM public.hotels h JOIN public.cities c ON c.id=h.city_id
  WHERE (p_city_id IS NULL OR h.city_id=p_city_id) AND (NOT p_active_only OR COALESCE(h.active,true))
  ORDER BY h.created_at DESC, h.name_ar;
$$;