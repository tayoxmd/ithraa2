-- إنشاء جدول البريد الإلكتروني إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS public.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL,
  to_email TEXT NOT NULL,
  to_name TEXT NOT NULL,
  body TEXT NOT NULL,
  body_html TEXT,
  status TEXT NOT NULL DEFAULT 'inbox' CHECK (status IN ('inbox', 'sent', 'draft', 'trash', 'spam')),
  status_id UUID REFERENCES public.email_statuses(id) ON DELETE SET NULL,
  filter_id UUID REFERENCES public.email_filters(id) ON DELETE SET NULL,
  has_replies BOOLEAN DEFAULT false,
  reply_count INTEGER DEFAULT 0,
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  attachments JSONB DEFAULT '[]'::jsonb,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- سياسات RLS: يمكن للجميع القراءة والكتابة
CREATE POLICY "يمكن للجميع قراءة البريد"
ON public.emails
FOR SELECT
USING (true);

CREATE POLICY "يمكن للجميع إدراج البريد"
ON public.emails
FOR INSERT
WITH CHECK (true);

CREATE POLICY "يمكن للجميع تحديث البريد"
ON public.emails
FOR UPDATE
USING (true);

CREATE POLICY "يمكن للجميع حذف البريد"
ON public.emails
FOR DELETE
USING (true);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_emails_status ON public.emails(status);
CREATE INDEX IF NOT EXISTS idx_emails_status_id ON public.emails(status_id);
CREATE INDEX IF NOT EXISTS idx_emails_filter_id ON public.emails(filter_id);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON public.emails(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emails_is_read ON public.emails(is_read);
CREATE INDEX IF NOT EXISTS idx_emails_priority ON public.emails(priority);

-- إنشاء trigger للتحديث التلقائي
CREATE TRIGGER update_emails_updated_at
BEFORE UPDATE ON public.emails
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

