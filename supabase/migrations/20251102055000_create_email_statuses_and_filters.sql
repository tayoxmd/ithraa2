-- إنشاء جدول حالات البريد
CREATE TABLE IF NOT EXISTS public.email_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(name_ar),
  UNIQUE(name_en)
);

-- إنشاء جدول فلاتر البريد
CREATE TABLE IF NOT EXISTS public.email_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  filter_type TEXT NOT NULL CHECK (filter_type IN ('inbox', 'sent', 'trash', 'spam', 'custom')),
  criteria JSONB DEFAULT '{}'::jsonb,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إضافة عمود status_id إلى جدول emails إذا لم يكن موجوداً
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'emails' AND column_name = 'status_id') THEN
    ALTER TABLE public.emails ADD COLUMN status_id UUID REFERENCES public.email_statuses(id) ON DELETE SET NULL;
  END IF;
  
  -- إضافة عمود filter_id إذا لم يكن موجوداً
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'emails' AND column_name = 'filter_id') THEN
    ALTER TABLE public.emails ADD COLUMN filter_id UUID REFERENCES public.email_filters(id) ON DELETE SET NULL;
  END IF;
END $$;

-- إدراج حالات افتراضية
INSERT INTO public.email_statuses (name_ar, name_en, color, icon, order_index) VALUES
  ('قيد المراجعة', 'Under Review', '#f59e0b', '🔍', 1),
  ('تم الرد', 'Replied', '#10b981', '✅', 2),
  ('مؤرشف', 'Archived', '#6b7280', '📦', 3),
  ('مهم', 'Important', '#ef4444', '⭐', 4),
  ('في الانتظار', 'Pending', '#3b82f6', '⏳', 5)
ON CONFLICT (name_ar) DO NOTHING;

-- إدراج فلاتر افتراضية (فقط إذا لم تكن موجودة)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.email_filters WHERE filter_type = 'inbox') THEN
    INSERT INTO public.email_filters (name_ar, name_en, filter_type, order_index) VALUES
      ('الوارد', 'Inbox', 'inbox', 1);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.email_filters WHERE filter_type = 'sent') THEN
    INSERT INTO public.email_filters (name_ar, name_en, filter_type, order_index) VALUES
      ('الصادر', 'Sent', 'sent', 2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.email_filters WHERE filter_type = 'trash') THEN
    INSERT INTO public.email_filters (name_ar, name_en, filter_type, order_index) VALUES
      ('المهملات', 'Trash', 'trash', 3);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.email_filters WHERE filter_type = 'spam') THEN
    INSERT INTO public.email_filters (name_ar, name_en, filter_type, order_index) VALUES
      ('السبام', 'Spam', 'spam', 4);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.email_filters WHERE filter_type = 'custom' AND name_ar = 'الكل') THEN
    INSERT INTO public.email_filters (name_ar, name_en, filter_type, order_index) VALUES
      ('الكل', 'All', 'custom', 5);
  END IF;
END $$;

-- تفعيل RLS
ALTER TABLE public.email_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_filters ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لحالات البريد: المدير فقط يمكنه الإدارة
CREATE POLICY "المدير فقط يمكنه إدارة حالات البريد"
ON public.email_statuses
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- سياسة للقراءة: يمكن للجميع قراءة الحالات النشطة
CREATE POLICY "يمكن للجميع قراءة حالات البريد النشطة"
ON public.email_statuses
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- سياسات RLS لفلاتر البريد: المدير فقط يمكنه الإدارة
CREATE POLICY "المدير فقط يمكنه إدارة فلاتر البريد"
ON public.email_filters
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- سياسة للقراءة: يمكن للجميع قراءة الفلاتر النشطة
CREATE POLICY "يمكن للجميع قراءة فلاتر البريد النشطة"
ON public.email_filters
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- إنشاء triggers للتحديث التلقائي
CREATE TRIGGER update_email_statuses_updated_at
BEFORE UPDATE ON public.email_statuses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_filters_updated_at
BEFORE UPDATE ON public.email_filters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_email_statuses_order ON public.email_statuses(order_index);
CREATE INDEX IF NOT EXISTS idx_email_statuses_active ON public.email_statuses(is_active);
CREATE INDEX IF NOT EXISTS idx_email_filters_type ON public.email_filters(filter_type);
CREATE INDEX IF NOT EXISTS idx_email_filters_active ON public.email_filters(is_active);
CREATE INDEX IF NOT EXISTS idx_emails_status_id ON public.emails(status_id);
CREATE INDEX IF NOT EXISTS idx_emails_filter_id ON public.emails(filter_id);

