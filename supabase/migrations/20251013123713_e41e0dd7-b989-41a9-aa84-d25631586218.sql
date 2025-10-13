-- إضافة رول جديد للشركات
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'company';

-- جدول طلبات الشركات
CREATE TABLE IF NOT EXISTS public.company_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name_ar TEXT NOT NULL,
  company_name_en TEXT NOT NULL,
  commercial_register TEXT NOT NULL,
  tax_number TEXT,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ
);

-- جدول المُلاك (Owners)
CREATE TABLE IF NOT EXISTS public.hotel_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name_ar TEXT NOT NULL,
  owner_name_en TEXT NOT NULL,
  national_id TEXT UNIQUE,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ربط الفنادق بالمُلاك
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.hotel_owners(id);

-- جدول سجل إجراءات الطلبات (Booking Actions Log)
CREATE TABLE IF NOT EXISTS public.booking_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('status_change', 'payment_status_change', 'hotel_confirmation', 'booking_modification', 'amount_change')),
  old_value TEXT,
  new_value TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- إضافة حقل نوع السرير في الغرف
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS bed_type_double TEXT DEFAULT 'double' CHECK (bed_type_double IN ('king', 'double'));

-- تفعيل RLS
ALTER TABLE public.company_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_actions_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies لطلبات الشركات
CREATE POLICY "Users can view their company requests"
  ON public.company_requests FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create company requests"
  ON public.company_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update company requests"
  ON public.company_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies للمُلاك
CREATE POLICY "Admins can manage hotel owners"
  ON public.hotel_owners FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view active owners"
  ON public.hotel_owners FOR SELECT
  USING (active = true);

-- RLS Policies لسجل الإجراءات
CREATE POLICY "Staff can view booking actions log"
  ON public.booking_actions_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'employee'::app_role));

CREATE POLICY "Staff can insert booking actions"
  ON public.booking_actions_log FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'employee'::app_role));

-- Triggers للتحديثات التلقائية
CREATE TRIGGER update_company_requests_updated_at
  BEFORE UPDATE ON public.company_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hotel_owners_updated_at
  BEFORE UPDATE ON public.hotel_owners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function لتسجيل إجراءات الطلبات تلقائياً
CREATE OR REPLACE FUNCTION public.log_booking_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- تسجيل تغيير الحالة
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.booking_actions_log (booking_id, user_id, action_type, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'status_change', OLD.status::text, NEW.status::text);
  END IF;
  
  -- تسجيل تغيير حالة الدفع
  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
    INSERT INTO public.booking_actions_log (booking_id, user_id, action_type, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'payment_status_change', OLD.payment_status::text, NEW.payment_status::text);
  END IF;
  
  -- تسجيل رقم التأكيد الفندقي
  IF OLD.hotel_confirmation_number IS DISTINCT FROM NEW.hotel_confirmation_number THEN
    INSERT INTO public.booking_actions_log (booking_id, user_id, action_type, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'hotel_confirmation', OLD.hotel_confirmation_number, NEW.hotel_confirmation_number);
  END IF;
  
  -- تسجيل تغيير المبلغ
  IF OLD.total_amount IS DISTINCT FROM NEW.total_amount OR OLD.amount_paid IS DISTINCT FROM NEW.amount_paid THEN
    INSERT INTO public.booking_actions_log (booking_id, user_id, action_type, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'amount_change', 
      jsonb_build_object('total', OLD.total_amount, 'paid', OLD.amount_paid)::text,
      jsonb_build_object('total', NEW.total_amount, 'paid', NEW.amount_paid)::text);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger لتسجيل الإجراءات
CREATE TRIGGER log_booking_changes
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_booking_action();