-- Add settings for meal badge text styling
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS meal_badge_text_color TEXT DEFAULT '#ffffff';

-- Add settings for meal description box styling (under hotel card and in booking page)
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS meal_description_bg_color TEXT DEFAULT '#f0fdf4',
ADD COLUMN IF NOT EXISTS meal_description_text_color TEXT DEFAULT '#15803d',
ADD COLUMN IF NOT EXISTS meal_description_font_size INTEGER DEFAULT 12,
ADD COLUMN IF NOT EXISTS meal_description_border_radius INTEGER DEFAULT 8,
ADD COLUMN IF NOT EXISTS meal_description_border_color TEXT DEFAULT '#86efac';