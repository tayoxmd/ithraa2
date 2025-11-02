-- إنشاء جدول قوالب البريد الإلكتروني
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  subject_ar TEXT,
  subject_en TEXT,
  body_html TEXT NOT NULL,
  body_text TEXT,
  signature_html TEXT,
  signature_text TEXT,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول عناصر القوالب (Components)
CREATE TABLE IF NOT EXISTS public.email_template_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.email_templates(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL CHECK (component_type IN ('text', 'image', 'button', 'divider', 'spacer', 'signature', 'variable')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  order_index INTEGER DEFAULT 0,
  style JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول إعدادات التصميم للبريد المرسل
CREATE TABLE IF NOT EXISTS public.email_design_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Desktop Settings
  desktop_width INTEGER DEFAULT 600,
  desktop_font_size INTEGER DEFAULT 14,
  desktop_line_height DECIMAL DEFAULT 1.6,
  desktop_background_color TEXT DEFAULT '#ffffff',
  desktop_text_color TEXT DEFAULT '#333333',
  -- Tablet Settings
  tablet_width INTEGER DEFAULT 768,
  tablet_font_size INTEGER DEFAULT 16,
  tablet_line_height DECIMAL DEFAULT 1.6,
  tablet_background_color TEXT DEFAULT '#ffffff',
  tablet_text_color TEXT DEFAULT '#333333',
  -- Mobile Settings
  mobile_width INTEGER DEFAULT 375,
  mobile_font_size INTEGER DEFAULT 14,
  mobile_line_height DECIMAL DEFAULT 1.5,
  mobile_background_color TEXT DEFAULT '#ffffff',
  mobile_text_color TEXT DEFAULT '#333333',
  -- Signature Settings
  signature_html TEXT,
  signature_text TEXT,
  signature_position TEXT DEFAULT 'bottom' CHECK (signature_position IN ('top', 'bottom')),
  -- General Settings
  default_template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول المتغيرات في القوالب
CREATE TABLE IF NOT EXISTS public.email_template_variables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.email_templates(id) ON DELETE CASCADE,
  variable_name TEXT NOT NULL,
  variable_label_ar TEXT,
  variable_label_en TEXT,
  variable_type TEXT DEFAULT 'text' CHECK (variable_type IN ('text', 'number', 'date', 'email', 'url', 'select')),
  variable_options JSONB DEFAULT '[]'::jsonb,
  is_required BOOLEAN DEFAULT false,
  default_value TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_template_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_design_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_template_variables ENABLE ROW LEVEL SECURITY;

-- سياسات RLS: المدير فقط يمكنه الإدارة
CREATE POLICY "المدير فقط يمكنه إدارة قوالب البريد"
ON public.email_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "يمكن للجميع قراءة القوالب النشطة"
ON public.email_templates
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المدير فقط يمكنه إدارة عناصر القوالب"
ON public.email_template_components
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المدير فقط يمكنه إدارة إعدادات التصميم"
ON public.email_design_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المدير فقط يمكنه إدارة متغيرات القوالب"
ON public.email_template_variables
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- إنشاء triggers للتحديث التلقائي
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_template_components_updated_at
BEFORE UPDATE ON public.email_template_components
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_design_settings_updated_at
BEFORE UPDATE ON public.email_design_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- إدراج إعدادات تصميم افتراضية
INSERT INTO public.email_design_settings (
  desktop_width, desktop_font_size, desktop_background_color, desktop_text_color,
  tablet_width, tablet_font_size, tablet_background_color, tablet_text_color,
  mobile_width, mobile_font_size, mobile_background_color, mobile_text_color
) VALUES (
  600, 14, '#ffffff', '#333333',
  768, 16, '#ffffff', '#333333',
  375, 14, '#ffffff', '#333333'
) ON CONFLICT DO NOTHING;

-- إضافة عمود has_replies إلى جدول emails إذا لم يكن موجوداً
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'emails' AND column_name = 'has_replies') THEN
    ALTER TABLE public.emails ADD COLUMN has_replies BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'emails' AND column_name = 'reply_count') THEN
    ALTER TABLE public.emails ADD COLUMN reply_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON public.email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_email_template_components_template ON public.email_template_components(template_id);
CREATE INDEX IF NOT EXISTS idx_email_template_variables_template ON public.email_template_variables(template_id);
CREATE INDEX IF NOT EXISTS idx_emails_has_replies ON public.emails(has_replies);

