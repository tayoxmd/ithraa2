-- المرحلة 1: إصلاح تسريب معلومات الاتصال بالفنادق
-- حذف السياسة الخطيرة التي تسمح بالوصول المباشر لجدول hotels
DROP POLICY IF EXISTS "Public can view hotels through view" ON public.hotels;

-- إنشاء function آمنة لقراءة الفنادق العامة فقط (بدون معلومات الاتصال)
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
  created_at timestamp with time zone,
  updated_at timestamp with time zone
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

-- السماح للجميع باستخدام هذه الـ function
GRANT EXECUTE ON FUNCTION public.get_public_hotels TO anon, authenticated;

-- إنشاء function بسيطة للحصول على فندق واحد
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
  created_at timestamp with time zone,
  updated_at timestamp with time zone
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

-- السماح للجميع باستخدام هذه الـ function
GRANT EXECUTE ON FUNCTION public.get_public_hotel TO anon, authenticated;