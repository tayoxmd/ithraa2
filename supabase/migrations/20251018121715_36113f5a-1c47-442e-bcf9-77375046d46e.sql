-- Add auto-width columns for meal badge settings
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS meal_badge_auto_width_mobile boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS meal_badge_auto_width_tablet boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS meal_badge_auto_width_desktop boolean DEFAULT false;