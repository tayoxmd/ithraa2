-- إضافة جدول إعدادات وظائف البريد
CREATE TABLE IF NOT EXISTS public.email_feature_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- تفعيل/إيقاف الوظائف
  enable_notifications BOOLEAN DEFAULT true,
  enable_auto_sync BOOLEAN DEFAULT true,
  enable_keyboard_shortcuts BOOLEAN DEFAULT true,
  enable_tags BOOLEAN DEFAULT true,
  enable_attachments BOOLEAN DEFAULT true,
  enable_translation BOOLEAN DEFAULT true,
  enable_export BOOLEAN DEFAULT true,
  enable_import BOOLEAN DEFAULT true,
  -- إعدادات المزامنة
  sync_interval INTEGER DEFAULT 60, -- بالثواني
  notification_check_interval INTEGER DEFAULT 30, -- بالثواني
  -- إعدادات أخرى
  auto_mark_read_after_days INTEGER DEFAULT 30,
  max_emails_per_page INTEGER DEFAULT 50,
  enable_email_preview BOOLEAN DEFAULT true,
  enable_email_search BOOLEAN DEFAULT true,
  enable_advanced_filters BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.email_feature_settings ENABLE ROW LEVEL SECURITY;

-- سياسات RLS: المدير فقط يمكنه الإدارة
CREATE POLICY "المدير فقط يمكنه إدارة إعدادات وظائف البريد"
ON public.email_feature_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- سياسة للقراءة: يمكن للجميع القراءة
CREATE POLICY "يمكن للجميع قراءة إعدادات وظائف البريد"
ON public.email_feature_settings
FOR SELECT
USING (true);

-- إدراج إعدادات افتراضية
INSERT INTO public.email_feature_settings (
  enable_notifications,
  enable_auto_sync,
  enable_keyboard_shortcuts,
  enable_tags,
  enable_attachments,
  enable_translation,
  enable_export,
  enable_import,
  sync_interval,
  notification_check_interval
) VALUES (
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  true,
  30, -- مزامنة كل 30 ثانية
  15  -- فحص الإشعارات كل 15 ثانية
) ON CONFLICT DO NOTHING;

-- إنشاء trigger للتحديث التلقائي
CREATE TRIGGER update_email_feature_settings_updated_at
BEFORE UPDATE ON public.email_feature_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


