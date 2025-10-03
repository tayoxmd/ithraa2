-- حذف عرض hotels_public لأنه لم يعد ضرورياً
-- نستخدم الآن الدوال الآمنة get_public_hotels و get_public_hotel
DROP VIEW IF EXISTS public.hotels_public;

-- للتوضيح: جميع الوصول العام للفنادق يتم الآن عبر:
-- 1. public.get_public_hotels(p_city_id, p_active_only) - لقائمة الفنادق
-- 2. public.get_public_hotel(p_hotel_id) - لفندق واحد
-- هذه الدوال آمنة ولا تكشف معلومات الاتصال (contact_phone, contact_person)