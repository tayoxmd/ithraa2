-- إضافة إعدادات شريط الوجبات في site_settings
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS meal_badge_color text DEFAULT '#007dff',
ADD COLUMN IF NOT EXISTS meal_badge_width integer DEFAULT 150,
ADD COLUMN IF NOT EXISTS meal_badge_height integer DEFAULT 32,
ADD COLUMN IF NOT EXISTS meal_badge_font_size integer DEFAULT 12,
ADD COLUMN IF NOT EXISTS meal_badge_border_radius integer DEFAULT 8;

-- التأكد من وجود حقل meal_plans في جدول hotels
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'hotels' 
    AND column_name = 'meal_plans'
  ) THEN
    ALTER TABLE public.hotels
    ADD COLUMN meal_plans jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;