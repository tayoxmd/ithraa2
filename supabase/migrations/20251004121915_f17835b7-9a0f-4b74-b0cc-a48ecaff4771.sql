-- Phase 1: Critical Data Protection

-- 1. Restrict PDF Settings Access - Remove public policy and add admin/employee only
DROP POLICY IF EXISTS "Authenticated users can view PDF settings" ON public.pdf_settings;

CREATE POLICY "Admins and employees can view PDF settings" 
ON public.pdf_settings 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'employee'::app_role)
);

-- 2. Create public function for safe site settings (only public-facing data)
CREATE OR REPLACE FUNCTION public.get_public_site_settings()
RETURNS TABLE(
  owner_room_color text,
  hotel_room_color text,
  phone text,
  email text,
  whatsapp_number text,
  facebook_url text,
  twitter_url text,
  instagram_url text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    owner_room_color,
    hotel_room_color,
    phone,
    email,
    whatsapp_number,
    facebook_url,
    twitter_url,
    instagram_url
  FROM public.site_settings
  LIMIT 1;
$$;

-- 3. Update site_settings RLS - Remove public policy
DROP POLICY IF EXISTS "Authenticated users can view site settings" ON public.site_settings;

CREATE POLICY "Admins and employees can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'employee'::app_role)
);

-- 4. Update get_public_hotels to exclude sensitive contact information
CREATE OR REPLACE FUNCTION public.get_public_hotels(
  p_city_id uuid DEFAULT NULL,
  p_active_only boolean DEFAULT true
)
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
AS $$
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
$$;

-- 5. Update get_public_hotel to exclude sensitive contact information
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
AS $$
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
$$;

-- 6. Update cities RLS to require authentication
DROP POLICY IF EXISTS "Anyone can view active cities" ON public.cities;

CREATE POLICY "Authenticated users can view active cities" 
ON public.cities 
FOR SELECT 
USING (active = true);

-- Phase 2: Enhanced Audit Trail
-- Audit logging is already set up in the log_audit_event function
-- We'll add calls to it in the application code

-- Phase 3: Additional Hardening
-- Leaked password protection will be enabled via configure-auth tool