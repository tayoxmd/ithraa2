-- إضافة نظام الوجبات للفنادق
CREATE TYPE meal_plan_type AS ENUM ('breakfast_only', 'half_board', 'full_board', 'all_inclusive', 'no_meals');

ALTER TABLE public.hotels
ADD COLUMN IF NOT EXISTS meal_plans JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.hotels.meal_plans IS 'خطط الوجبات المتاحة مع الأسعار - مثال: [{"type": "breakfast_only", "price": 50, "name_ar": "إفطار فقط", "name_en": "Breakfast Only"}]';

-- إنشاء جدول تخصيص الأسعار حسب المواسم والتواريخ
CREATE TABLE IF NOT EXISTS public.hotel_seasonal_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  season_name_ar TEXT NOT NULL,
  season_name_en TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_per_night NUMERIC NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT valid_price CHECK (price_per_night >= 0)
);

CREATE INDEX idx_hotel_seasonal_pricing_hotel_id ON public.hotel_seasonal_pricing(hotel_id);
CREATE INDEX idx_hotel_seasonal_pricing_dates ON public.hotel_seasonal_pricing(start_date, end_date);

COMMENT ON TABLE public.hotel_seasonal_pricing IS 'تخصيص أسعار الفنادق حسب المواسم والأعياد';

-- إنشاء جدول رواتب الموظفين
CREATE TABLE IF NOT EXISTS public.employee_salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_salary NUMERIC NOT NULL DEFAULT 0,
  bonus NUMERIC DEFAULT 0,
  deductions NUMERIC DEFAULT 0,
  payment_date DATE NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_salary CHECK (monthly_salary >= 0),
  CONSTRAINT valid_bonus CHECK (bonus >= 0),
  CONSTRAINT valid_deductions CHECK (deductions >= 0)
);

CREATE INDEX idx_employee_salaries_employee_id ON public.employee_salaries(employee_id);
CREATE INDEX idx_employee_salaries_payment_date ON public.employee_salaries(payment_date);

COMMENT ON TABLE public.employee_salaries IS 'سجل رواتب الموظفين الشهرية';

-- إنشاء جدول حضور وانصراف الموظفين
CREATE TABLE IF NOT EXISTS public.employee_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out TIMESTAMP WITH TIME ZONE,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_employee_attendance_employee_id ON public.employee_attendance(employee_id);
CREATE INDEX idx_employee_attendance_date ON public.employee_attendance(attendance_date);

COMMENT ON TABLE public.employee_attendance IS 'سجل حضور وانصراف الموظفين';

-- إنشاء جدول إعدادات API
CREATE TABLE IF NOT EXISTS public.api_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT NOT NULL UNIQUE,
  api_secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  allowed_origins JSONB DEFAULT '[]'::jsonb,
  rate_limit INTEGER DEFAULT 1000,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE public.api_settings IS 'إعدادات API للربط مع المواقع الخارجية';

-- إنشاء جدول طلبات API
CREATE TABLE IF NOT EXISTS public.api_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.api_settings(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_body JSONB,
  response_status INTEGER,
  response_body JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_api_requests_api_key_id ON public.api_requests(api_key_id);
CREATE INDEX idx_api_requests_created_at ON public.api_requests(created_at);

COMMENT ON TABLE public.api_requests IS 'سجل طلبات API';

-- جعل الضريبة العامة صفر افتراضياً
UPDATE public.site_settings
SET tax_percentage = 0
WHERE tax_percentage IS NULL OR tax_percentage = 15;

ALTER TABLE public.site_settings
ALTER COLUMN tax_percentage SET DEFAULT 0;

-- تحديث الضريبة في الفنادق لتكون صفر افتراضياً
ALTER TABLE public.hotels
ALTER COLUMN tax_percentage SET DEFAULT 0;

-- تفعيل RLS على الجداول الجديدة
ALTER TABLE public.hotel_seasonal_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_requests ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لتخصيص الأسعار الموسمية
CREATE POLICY "Admins can manage seasonal pricing"
ON public.hotel_seasonal_pricing
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view seasonal pricing"
ON public.hotel_seasonal_pricing
FOR SELECT
TO authenticated
USING (true);

-- سياسات RLS لرواتب الموظفين
CREATE POLICY "Admins can manage employee salaries"
ON public.employee_salaries
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employees can view their own salaries"
ON public.employee_salaries
FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

-- سياسات RLS لحضور الموظفين
CREATE POLICY "Admins can manage employee attendance"
ON public.employee_attendance
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employees can view their own attendance"
ON public.employee_attendance
FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

CREATE POLICY "Employees can insert their own attendance"
ON public.employee_attendance
FOR INSERT
TO authenticated
WITH CHECK (employee_id = auth.uid());

-- سياسات RLS لإعدادات API
CREATE POLICY "Only admins can manage API settings"
ON public.api_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- سياسات RLS لطلبات API
CREATE POLICY "Only admins can view API requests"
ON public.api_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- إنشاء دالة لحساب السعر حسب التاريخ
CREATE OR REPLACE FUNCTION public.get_hotel_price_for_date(
  p_hotel_id UUID,
  p_check_in_date DATE
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seasonal_price NUMERIC;
  v_base_price NUMERIC;
BEGIN
  -- البحث عن سعر موسمي
  SELECT price_per_night INTO v_seasonal_price
  FROM public.hotel_seasonal_pricing
  WHERE hotel_id = p_hotel_id
    AND p_check_in_date BETWEEN start_date AND end_date
    AND is_available = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- إذا لم يوجد سعر موسمي، استخدام السعر الأساسي
  IF v_seasonal_price IS NULL THEN
    SELECT price_per_night INTO v_base_price
    FROM public.hotels
    WHERE id = p_hotel_id;
    
    RETURN v_base_price;
  END IF;
  
  RETURN v_seasonal_price;
END;
$$;

-- إضافة trigger لتحديث updated_at
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

CREATE TRIGGER update_hotel_seasonal_pricing_updated_at
BEFORE UPDATE ON public.hotel_seasonal_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_salaries_updated_at
BEFORE UPDATE ON public.employee_salaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_attendance_updated_at
BEFORE UPDATE ON public.employee_attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_settings_updated_at
BEFORE UPDATE ON public.api_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();