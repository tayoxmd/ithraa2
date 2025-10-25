-- إنشاء جدول إصدارات الثيمات
CREATE TABLE IF NOT EXISTS public.theme_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  theme_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول إجراءات المسؤول (للتدقيق)
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول أصول المؤشرات (Loading Indicators)
CREATE TABLE IF NOT EXISTS public.indicator_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('svg', 'json', 'js')),
  asset_data TEXT NOT NULL,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  viewport_rules JSONB DEFAULT '{"mobile": {}, "tablet": {}, "desktop": {}}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول تدقيق الكاش
CREATE TABLE IF NOT EXISTS public.cache_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  cache_keys TEXT[],
  purge_status TEXT,
  details JSONB,
  initiated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إنشاء جدول تدقيق الرفع
CREATE TABLE IF NOT EXISTS public.upload_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  upload_target TEXT NOT NULL CHECK (upload_target IN ('public-assets', 'guest-uploads', 'staff-uploads', 'booking-pdfs')),
  status TEXT NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إضافة أعمدة للمستخدمين (على جدول profiles)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme TEXT,
ADD COLUMN IF NOT EXISTS force_theme TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- إضافة triggers للتحديث التلقائي
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_theme_versions_updated_at
  BEFORE UPDATE ON public.theme_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indicator_assets_updated_at
  BEFORE UPDATE ON public.indicator_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- إضافة indexes للأداء
CREATE INDEX IF NOT EXISTS idx_theme_versions_active ON public.theme_versions(is_active);
CREATE INDEX IF NOT EXISTS idx_theme_versions_default ON public.theme_versions(is_default);
CREATE INDEX IF NOT EXISTS idx_admin_actions_user ON public.admin_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created ON public.admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_indicator_assets_active ON public.indicator_assets(is_active);
CREATE INDEX IF NOT EXISTS idx_upload_audit_user ON public.upload_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_audit_target ON public.upload_audit(upload_target);

-- Enable RLS
ALTER TABLE public.theme_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicator_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cache_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view active themes"
  ON public.theme_versions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view their upload audit"
  ON public.upload_audit FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view active indicators"
  ON public.indicator_assets FOR SELECT
  USING (is_active = true);

-- إدراج ثيمات افتراضية
INSERT INTO public.theme_versions (name, version, theme_data, is_default, is_active) VALUES
('Navy Modern', 1, '{
  "colors": {
    "primary": "220 90% 56%",
    "secondary": "220 14% 96%",
    "accent": "220 90% 48%",
    "background": "0 0% 100%",
    "foreground": "220 13% 13%"
  },
  "spacing": {"base": "1rem"},
  "typography": {"base": "16px", "scale": 1.25},
  "container": {"mobile": "100%", "tablet": "768px", "desktop": "1280px"}
}', true, true),
('White Clean', 1, '{
  "colors": {
    "primary": "0 0% 100%",
    "secondary": "240 5% 96%",
    "accent": "220 90% 48%",
    "background": "0 0% 100%",
    "foreground": "240 10% 4%"
  },
  "spacing": {"base": "1rem"},
  "typography": {"base": "16px", "scale": 1.2},
  "container": {"mobile": "100%", "tablet": "768px", "desktop": "1280px"}
}', false, true),
('Black Minimal', 1, '{
  "colors": {
    "primary": "0 0% 9%",
    "secondary": "240 4% 16%",
    "accent": "0 0% 100%",
    "background": "0 0% 9%",
    "foreground": "0 0% 100%"
  },
  "spacing": {"base": "1rem"},
  "typography": {"base": "16px", "scale": 1.2},
  "container": {"mobile": "100%", "tablet": "768px", "desktop": "1280px"}
}', false, true),
('Navy Variant', 1, '{
  "colors": {
    "primary": "220 90% 56%",
    "secondary": "240 4% 16%",
    "accent": "220 90% 48%",
    "background": "0 0% 9%",
    "foreground": "0 0% 100%"
  },
  "spacing": {"base": "1rem"},
  "typography": {"base": "16px", "scale": 1.2},
  "container": {"mobile": "100%", "tablet": "768px", "desktop": "1280px"}
}', false, true)
ON CONFLICT DO NOTHING;