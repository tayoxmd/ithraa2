-- إضافة حقول IMAP و POP3 إلى جدول email_settings إذا كان موجوداً
-- وإنشاء الجدول إذا لم يكن موجوداً

-- إنشاء جدول email_settings إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS public.email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_theme TEXT DEFAULT 'design2',
  -- SMTP Settings
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_username TEXT,
  smtp_password TEXT,
  smtp_encryption TEXT DEFAULT 'tls',
  -- IMAP Settings
  imap_host TEXT,
  imap_port INTEGER DEFAULT 993,
  imap_username TEXT,
  imap_password TEXT,
  imap_encryption TEXT DEFAULT 'ssl',
  -- POP3 Settings
  pop3_host TEXT,
  pop3_port INTEGER DEFAULT 995,
  pop3_username TEXT,
  pop3_password TEXT,
  pop3_encryption TEXT DEFAULT 'ssl',
  -- Default Sender
  from_email TEXT,
  from_name TEXT,
  -- Backup & Forwarding
  backup_email TEXT,
  backup_enabled BOOLEAN DEFAULT false,
  forward_to TEXT,
  forward_enabled BOOLEAN DEFAULT false,
  -- Colors
  inbox_color TEXT DEFAULT '#3b82f6',
  sent_color TEXT DEFAULT '#10b981',
  trash_color TEXT DEFAULT '#ef4444',
  spam_color TEXT DEFAULT '#f59e0b',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إضافة الأعمدة الجديدة إذا كان الجدول موجوداً بالفعل
DO $$ 
BEGIN
  -- إضافة حقول IMAP إذا لم تكن موجودة
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_settings' AND column_name = 'imap_host') THEN
    ALTER TABLE public.email_settings ADD COLUMN imap_host TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_settings' AND column_name = 'imap_port') THEN
    ALTER TABLE public.email_settings ADD COLUMN imap_port INTEGER DEFAULT 993;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_settings' AND column_name = 'imap_username') THEN
    ALTER TABLE public.email_settings ADD COLUMN imap_username TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_settings' AND column_name = 'imap_password') THEN
    ALTER TABLE public.email_settings ADD COLUMN imap_password TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_settings' AND column_name = 'imap_encryption') THEN
    ALTER TABLE public.email_settings ADD COLUMN imap_encryption TEXT DEFAULT 'ssl';
  END IF;

  -- إضافة حقول POP3 إذا لم تكن موجودة
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_settings' AND column_name = 'pop3_host') THEN
    ALTER TABLE public.email_settings ADD COLUMN pop3_host TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_settings' AND column_name = 'pop3_port') THEN
    ALTER TABLE public.email_settings ADD COLUMN pop3_port INTEGER DEFAULT 995;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_settings' AND column_name = 'pop3_username') THEN
    ALTER TABLE public.email_settings ADD COLUMN pop3_username TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_settings' AND column_name = 'pop3_password') THEN
    ALTER TABLE public.email_settings ADD COLUMN pop3_password TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'email_settings' AND column_name = 'pop3_encryption') THEN
    ALTER TABLE public.email_settings ADD COLUMN pop3_encryption TEXT DEFAULT 'ssl';
  END IF;
END $$;

-- تفعيل RLS
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- سياسات RLS: فقط المدير يمكنه إدارة إعدادات البريد
CREATE POLICY "المدير فقط يمكنه إدارة إعدادات البريد"
ON public.email_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- سياسة للقراءة: يمكن للمستخدمين المصادقين قراءة الإعدادات
CREATE POLICY "المستخدمون المصادقون يمكنهم قراءة إعدادات البريد"
ON public.email_settings
FOR SELECT
USING (true);

-- إنشاء trigger للتحديث التلقائي
CREATE TRIGGER update_email_settings_updated_at
BEFORE UPDATE ON public.email_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- إنشاء جدول email_access_users إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS public.email_access_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- تفعيل RLS على email_access_users
ALTER TABLE public.email_access_users ENABLE ROW LEVEL SECURITY;

-- سياسات RLS لـ email_access_users
CREATE POLICY "المدير فقط يمكنه إدارة صلاحيات الوصول للبريد"
ON public.email_access_users
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المستخدمون يمكنهم رؤية صلاحياتهم"
ON public.email_access_users
FOR SELECT
USING (user_id = auth.uid());

