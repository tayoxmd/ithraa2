-- Fix functions missing SET search_path = public
-- This prevents schema hijacking attacks

-- Fix get_available_rooms_count
CREATE OR REPLACE FUNCTION public.get_available_rooms_count(p_hotel_id uuid, p_check_in date, p_check_out date)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- Added security protection
AS $function$
DECLARE
  v_total_rooms INTEGER;
  v_booked_rooms INTEGER;
BEGIN
  -- Get total rooms for the hotel
  SELECT total_rooms INTO v_total_rooms
  FROM hotels
  WHERE id = p_hotel_id;
  
  IF v_total_rooms IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate booked rooms for overlapping dates
  SELECT COALESCE(SUM(rooms_booked), 0) INTO v_booked_rooms
  FROM room_availability
  WHERE hotel_id = p_hotel_id
    AND check_in < p_check_out
    AND check_out > p_check_in;
  
  -- Return available rooms
  RETURN GREATEST(0, v_total_rooms - v_booked_rooms);
END;
$function$;

-- Fix calculate_task_remaining_amount trigger function
CREATE OR REPLACE FUNCTION public.calculate_task_remaining_amount()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public  -- Added security protection
AS $function$
BEGIN
  IF NEW.is_financial = true AND NEW.amount_total IS NOT NULL THEN
    NEW.amount_remaining := NEW.amount_total - COALESCE(NEW.amount_paid, 0);
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public  -- Added security protection
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;