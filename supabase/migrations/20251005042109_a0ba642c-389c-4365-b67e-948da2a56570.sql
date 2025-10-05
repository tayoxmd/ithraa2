-- إضافة حقول أكواد الدردشة والإضافات الخارجية في إعدادات الموقع
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS chat_widget_code TEXT,
ADD COLUMN IF NOT EXISTS custom_head_code TEXT,
ADD COLUMN IF NOT EXISTS custom_body_code TEXT;

COMMENT ON COLUMN public.site_settings.chat_widget_code IS 'كود الدردشة الحية مثل Tidio أو غيره';
COMMENT ON COLUMN public.site_settings.custom_head_code IS 'أكواد مخصصة توضع في head';
COMMENT ON COLUMN public.site_settings.custom_body_code IS 'أكواد مخصصة توضع في نهاية body';