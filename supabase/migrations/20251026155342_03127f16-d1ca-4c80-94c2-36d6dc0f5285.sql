-- إنشاء جدول صلاحيات الوصول للحسابات الخاصة
CREATE TABLE IF NOT EXISTS public.private_account_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  granted_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول المُلاّك للحسابات الخاصة
CREATE TABLE IF NOT EXISTS public.private_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  national_id TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول الفنادق الخاصة
CREATE TABLE IF NOT EXISTS public.private_hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.private_owners(id),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  location TEXT,
  city TEXT,
  total_rooms INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول الغرف الخاصة
CREATE TABLE IF NOT EXISTS public.private_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id UUID NOT NULL REFERENCES public.private_hotels(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  room_type TEXT,
  price_per_night NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'available',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول المعاملات المالية للحسابات الخاصة
CREATE TABLE IF NOT EXISTS public.private_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  hotel_id UUID REFERENCES public.private_hotels(id),
  category TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول الخزنة
CREATE TABLE IF NOT EXISTS public.private_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC(10,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID
);

-- إدراج سجل افتراضي للخزنة
INSERT INTO public.private_vault (amount) VALUES (0) ON CONFLICT DO NOTHING;

-- تفعيل RLS
ALTER TABLE public.private_account_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_vault ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للوصول للحسابات الخاصة
CREATE POLICY "المدراء وموظفو الحسابات وأصحاب الصلاحية يمكنهم إدارة صلاحيات الوصول"
ON public.private_account_access
FOR ALL
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'specific_financial_employee'::app_role])
)
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role])
);

CREATE POLICY "المستخدمون يمكنهم رؤية صلاحياتهم"
ON public.private_account_access
FOR SELECT
USING (user_id = auth.uid());

-- سياسات RLS للمُلاّك
CREATE POLICY "أصحاب الصلاحية يمكنهم إدارة المُلاّك"
ON public.private_owners
FOR ALL
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'specific_financial_employee'::app_role])
  OR EXISTS (SELECT 1 FROM public.private_account_access WHERE user_id = auth.uid())
);

-- سياسات RLS للفنادق الخاصة
CREATE POLICY "أصحاب الصلاحية يمكنهم إدارة الفنادق"
ON public.private_hotels
FOR ALL
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'specific_financial_employee'::app_role])
  OR EXISTS (SELECT 1 FROM public.private_account_access WHERE user_id = auth.uid())
);

-- سياسات RLS للغرف
CREATE POLICY "أصحاب الصلاحية يمكنهم إدارة الغرف"
ON public.private_rooms
FOR ALL
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'specific_financial_employee'::app_role])
  OR EXISTS (SELECT 1 FROM public.private_account_access WHERE user_id = auth.uid())
);

-- سياسات RLS للمعاملات المالية
CREATE POLICY "أصحاب الصلاحية يمكنهم إدارة المعاملات"
ON public.private_transactions
FOR ALL
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'specific_financial_employee'::app_role])
  OR EXISTS (SELECT 1 FROM public.private_account_access WHERE user_id = auth.uid())
);

-- سياسات RLS للخزنة
CREATE POLICY "أصحاب الصلاحية يمكنهم إدارة الخزنة"
ON public.private_vault
FOR ALL
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'specific_financial_employee'::app_role])
  OR EXISTS (SELECT 1 FROM public.private_account_access WHERE user_id = auth.uid())
);

-- إنشاء triggers للتحديث التلقائي
CREATE TRIGGER update_private_account_access_updated_at
BEFORE UPDATE ON public.private_account_access
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_private_owners_updated_at
BEFORE UPDATE ON public.private_owners
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_private_hotels_updated_at
BEFORE UPDATE ON public.private_hotels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_private_rooms_updated_at
BEFORE UPDATE ON public.private_rooms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_private_transactions_updated_at
BEFORE UPDATE ON public.private_transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();