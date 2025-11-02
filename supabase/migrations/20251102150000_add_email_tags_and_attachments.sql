-- إضافة جدول علامات البريد (Tags)
CREATE TABLE IF NOT EXISTS public.email_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إضافة جدول ربط البريد بالعلامات
CREATE TABLE IF NOT EXISTS public.email_email_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID REFERENCES public.emails(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.email_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(email_id, tag_id)
);

-- إضافة جدول مرفقات البريد
CREATE TABLE IF NOT EXISTS public.email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID REFERENCES public.emails(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إضافة عمود tags إلى جدول emails (للحفظ السريع)
ALTER TABLE public.emails ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[];

-- تفعيل RLS
ALTER TABLE public.email_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_email_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_attachments ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "يمكن للجميع قراءة العلامات"
ON public.email_tags
FOR SELECT
USING (true);

CREATE POLICY "المدير فقط يمكنه إدارة العلامات"
ON public.email_tags
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "يمكن للجميع إدارة ربط البريد بالعلامات"
ON public.email_email_tags
FOR ALL
USING (true);

CREATE POLICY "يمكن للجميع إدارة المرفقات"
ON public.email_attachments
FOR ALL
USING (true);

-- إنشاء فهارس
CREATE INDEX IF NOT EXISTS idx_email_tags_name ON public.email_tags(name_ar, name_en);
CREATE INDEX IF NOT EXISTS idx_email_email_tags_email ON public.email_email_tags(email_id);
CREATE INDEX IF NOT EXISTS idx_email_email_tags_tag ON public.email_email_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_emails_tags ON public.emails USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_email_attachments_email ON public.email_attachments(email_id);

-- إدراج علامات افتراضية
INSERT INTO public.email_tags (name_ar, name_en, color) VALUES
  ('مهم', 'Important', '#ef4444'),
  ('عاجل', 'Urgent', '#f59e0b'),
  ('متابعة', 'Follow Up', '#3b82f6'),
  ('مؤرشف', 'Archived', '#6b7280'),
  ('شخصي', 'Personal', '#10b981')
ON CONFLICT DO NOTHING;
