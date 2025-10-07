-- Drop and recreate create_system_backup to fix return type
DROP FUNCTION IF EXISTS public.create_system_backup();

CREATE OR REPLACE FUNCTION public.create_system_backup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_data jsonb;
  v_settings_id uuid;
  v_version int;
BEGIN
  -- Collect backup data
  v_data := jsonb_build_object(
    'cities', coalesce((SELECT jsonb_agg(row_to_json(c)) FROM (SELECT id, name_ar, name_en, active FROM public.cities) c), '[]'::jsonb),
    'hotels', coalesce((SELECT jsonb_agg(row_to_json(h)) FROM (SELECT id, name_ar, name_en, city_id, price_per_night, rating, images, meal_plans, amenities, location, active FROM public.hotels) h), '[]'::jsonb),
    'profiles', coalesce((SELECT jsonb_agg(row_to_json(p)) FROM (SELECT id, full_name, phone FROM public.profiles) p), '[]'::jsonb),
    'reviews', coalesce((SELECT jsonb_agg(row_to_json(r)) FROM (SELECT id, hotel_id, user_id, rating, comment, status, created_at FROM public.reviews) r), '[]'::jsonb),
    'whatsapp_settings', coalesce((SELECT jsonb_agg(row_to_json(w)) FROM public.whatsapp_settings w), '[]'::jsonb),
    'site_settings', coalesce((SELECT jsonb_agg(row_to_json(s)) FROM (SELECT user_theme, admin_theme, meal_badge_color, meal_badge_width, meal_badge_height, meal_badge_font_size, meal_badge_border_radius, disable_animations, animation_speed_multiplier, loader_enabled, loader_speed_ms, loader_type, owner_room_color, hotel_room_color, tax_percentage FROM public.site_settings) s), '[]'::jsonb)
  );

  -- Get existing settings
  SELECT id, coalesce(backup_version, 0) INTO v_settings_id, v_version FROM public.site_settings LIMIT 1;

  -- Update or insert
  IF v_settings_id IS NULL THEN
    INSERT INTO public.site_settings (backup_created_at, backup_version, backup_data)
    VALUES (now(), 1, v_data);
  ELSE
    UPDATE public.site_settings
    SET backup_created_at = now(),
        backup_version = v_version + 1,
        backup_data = v_data,
        updated_at = now()
    WHERE id = v_settings_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_system_backup() TO authenticated;