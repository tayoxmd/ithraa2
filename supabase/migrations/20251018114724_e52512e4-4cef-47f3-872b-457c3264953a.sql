-- Add responsive size fields for meal badge
ALTER TABLE public.site_settings
ADD COLUMN meal_badge_width_mobile integer DEFAULT 120,
ADD COLUMN meal_badge_height_mobile integer DEFAULT 24,
ADD COLUMN meal_badge_width_tablet integer DEFAULT 150,
ADD COLUMN meal_badge_height_tablet integer DEFAULT 32,
ADD COLUMN meal_badge_width_desktop integer DEFAULT 180,
ADD COLUMN meal_badge_height_desktop integer DEFAULT 36;