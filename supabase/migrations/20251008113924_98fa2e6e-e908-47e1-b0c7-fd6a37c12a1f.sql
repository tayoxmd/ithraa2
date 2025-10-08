-- Add Tidio API fields to site_settings
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS tidio_public_key TEXT,
ADD COLUMN IF NOT EXISTS tidio_private_key TEXT,
ADD COLUMN IF NOT EXISTS tidio_client_id TEXT,
ADD COLUMN IF NOT EXISTS tidio_client_secret TEXT;