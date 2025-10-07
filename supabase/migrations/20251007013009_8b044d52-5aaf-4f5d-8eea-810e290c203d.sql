-- Ensure site_settings exists and add loader/motion columns
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS disable_animations boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS animation_speed_multiplier numeric NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS loader_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS loader_speed_ms integer NOT NULL DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS loader_type text NOT NULL DEFAULT 'spinner',
  ADD COLUMN IF NOT EXISTS loader_custom_html text,
  ADD COLUMN IF NOT EXISTS loader_custom_css text,
  ADD COLUMN IF NOT EXISTS loader_custom_js text;