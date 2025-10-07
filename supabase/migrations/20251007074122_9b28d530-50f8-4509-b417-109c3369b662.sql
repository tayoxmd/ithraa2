-- Add backup fields to site_settings table
ALTER TABLE site_settings 
ADD COLUMN IF NOT EXISTS backup_data jsonb,
ADD COLUMN IF NOT EXISTS backup_created_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS backup_version integer DEFAULT 1;

-- Create a function to create backup
CREATE OR REPLACE FUNCTION create_system_backup()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  backup_data jsonb;
BEGIN
  -- Collect all important data
  backup_data := jsonb_build_object(
    'version', 1,
    'created_at', now(),
    'cities', (SELECT jsonb_agg(row_to_json(cities.*)) FROM cities),
    'hotels', (SELECT jsonb_agg(row_to_json(hotels.*)) FROM hotels),
    'hotel_seasonal_pricing', (SELECT jsonb_agg(row_to_json(hotel_seasonal_pricing.*)) FROM hotel_seasonal_pricing),
    'coupons', (SELECT jsonb_agg(row_to_json(coupons.*)) FROM coupons),
    'coupon_hotels', (SELECT jsonb_agg(row_to_json(coupon_hotels.*)) FROM coupon_hotels),
    'site_settings', (SELECT row_to_json(site_settings.*) FROM site_settings LIMIT 1),
    'whatsapp_settings', (SELECT row_to_json(whatsapp_settings.*) FROM whatsapp_settings LIMIT 1),
    'pdf_settings', (SELECT row_to_json(pdf_settings.*) FROM pdf_settings LIMIT 1)
  );
  
  -- Store in site_settings
  UPDATE site_settings 
  SET 
    backup_data = backup_data,
    backup_created_at = now(),
    backup_version = COALESCE(backup_version, 0) + 1;
  
  RETURN backup_data;
END;
$$;

-- Grant execute permission to authenticated users with admin role
GRANT EXECUTE ON FUNCTION create_system_backup() TO authenticated;