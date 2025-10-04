-- Drop existing functions
DROP FUNCTION IF EXISTS public.get_public_hotels(uuid, boolean);
DROP FUNCTION IF EXISTS public.get_public_hotel(uuid);

-- Recreate get_public_hotels function with extra guest fields
CREATE OR REPLACE FUNCTION public.get_public_hotels(p_city_id uuid DEFAULT NULL::uuid, p_active_only boolean DEFAULT true)
 RETURNS TABLE(
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
   active boolean, 
   created_at timestamp with time zone, 
   updated_at timestamp with time zone,
   max_guests_per_room integer,
   extra_guest_price numeric,
   total_rooms integer,
   tax_percentage numeric,
   room_type room_type
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    h.id,
    h.name_ar,
    h.name_en,
    h.description_ar,
    h.description_en,
    h.location,
    h.location_url,
    h.city_id,
    c.name_ar as city_name_ar,
    c.name_en as city_name_en,
    h.price_per_night,
    h.rating,
    h.images,
    h.active,
    h.created_at,
    h.updated_at,
    h.max_guests_per_room,
    h.extra_guest_price,
    h.total_rooms,
    h.tax_percentage,
    h.room_type
  FROM public.hotels h
  LEFT JOIN public.cities c ON h.city_id = c.id
  WHERE (p_city_id IS NULL OR h.city_id = p_city_id)
    AND (NOT p_active_only OR h.active = true);
$function$;

-- Recreate get_public_hotel function with extra guest fields
CREATE OR REPLACE FUNCTION public.get_public_hotel(p_hotel_id uuid)
 RETURNS TABLE(
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
   active boolean, 
   created_at timestamp with time zone, 
   updated_at timestamp with time zone,
   max_guests_per_room integer,
   extra_guest_price numeric,
   total_rooms integer,
   tax_percentage numeric,
   room_type room_type
 )
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    h.id,
    h.name_ar,
    h.name_en,
    h.description_ar,
    h.description_en,
    h.location,
    h.location_url,
    h.city_id,
    c.name_ar as city_name_ar,
    c.name_en as city_name_en,
    h.price_per_night,
    h.rating,
    h.images,
    h.active,
    h.created_at,
    h.updated_at,
    h.max_guests_per_room,
    h.extra_guest_price,
    h.total_rooms,
    h.tax_percentage,
    h.room_type
  FROM public.hotels h
  LEFT JOIN public.cities c ON h.city_id = c.id
  WHERE h.id = p_hotel_id AND h.active = true;
$function$;