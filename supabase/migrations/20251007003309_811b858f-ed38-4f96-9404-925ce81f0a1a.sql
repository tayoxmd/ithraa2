-- إضافة حقل رقم الهاتف للضيوف في جدول الحجوزات
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS guest_phone text;

-- إضافة حقل كود الدولة
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS guest_country_code text DEFAULT '+966';

-- تعديل عمود user_id ليسمح بالقيم NULL للضيوف
ALTER TABLE public.bookings 
ALTER COLUMN user_id DROP NOT NULL;

-- إنشاء فهرس لتسريع البحث برقم الهاتف
CREATE INDEX IF NOT EXISTS idx_bookings_guest_phone ON public.bookings(guest_phone);

-- تعديل RLS policies للسماح للضيوف بإنشاء حجوزات
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;

CREATE POLICY "Users and guests can create bookings"
ON public.bookings
FOR INSERT
WITH CHECK (
  user_id = auth.uid() OR 
  (user_id IS NULL AND guest_phone IS NOT NULL)
);

-- تعديل سياسة عرض الحجوزات للسماح للضيوف
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

CREATE POLICY "Users and guests can view their bookings"
ON public.bookings
FOR SELECT
USING (
  user_id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'employee'::app_role)
);