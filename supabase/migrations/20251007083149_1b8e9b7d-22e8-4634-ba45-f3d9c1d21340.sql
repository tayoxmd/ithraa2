-- Add theme selection columns to site_settings
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS user_theme TEXT DEFAULT 'design1',
ADD COLUMN IF NOT EXISTS admin_theme TEXT DEFAULT 'design1';