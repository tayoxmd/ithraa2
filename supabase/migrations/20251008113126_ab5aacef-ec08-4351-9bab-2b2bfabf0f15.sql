-- Add Tidio chat widget code to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS tidio_widget_code text;