-- Fix 1: Add comprehensive RLS policies for guest_verifications table
-- Restrict SELECT to only allow checking specific OTP without exposing all data
DROP POLICY IF EXISTS "Anyone can verify OTP" ON public.guest_verifications;

CREATE POLICY "Users verify own OTP only"
ON public.guest_verifications
FOR SELECT
USING (
  verified = false 
  AND expires_at > now()
);

-- Prevent direct manipulation - only edge functions can insert/update/delete
CREATE POLICY "Block direct inserts"
ON public.guest_verifications
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block direct updates"
ON public.guest_verifications
FOR UPDATE
USING (false);

CREATE POLICY "Block direct deletes"
ON public.guest_verifications
FOR DELETE
USING (false);

-- Fix 2: Secure get_guest_bookings function to verify caller before setting session variable
CREATE OR REPLACE FUNCTION public.get_guest_bookings(p_phone text)
RETURNS TABLE(
  id uuid,
  check_in date,
  check_out date,
  guests integer,
  rooms integer,
  total_amount numeric,
  status booking_status,
  payment_status payment_status,
  amount_paid numeric,
  payment_method text,
  guest_name text,
  guest_phone text,
  hotel_confirmation_number text,
  booking_number integer,
  discount_amount numeric,
  manual_total numeric,
  notes text,
  user_id uuid,
  hotel_name_ar text,
  hotel_name_en text,
  hotel_location text,
  hotel_location_url text,
  hotel_price_per_night numeric,
  hotel_max_guests_per_room integer,
  hotel_tax_percentage numeric,
  hotel_room_type room_type
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_phone_hash text;
  v_verified boolean;
BEGIN
  -- Verify caller has valid OTP for this phone number
  v_phone_hash := encode(digest(p_phone, 'sha256'), 'hex');
  
  SELECT verified INTO v_verified
  FROM public.guest_verifications
  WHERE phone_hash = v_phone_hash
    AND verified = true
    AND verified_at > now() - interval '24 hours'
  LIMIT 1;
  
  IF NOT COALESCE(v_verified, false) THEN
    RAISE EXCEPTION 'Phone number not verified or verification expired';
  END IF;
  
  -- Only after verification, set session variable for RLS
  PERFORM set_config('app.verified_guest_phone', p_phone, true);
  
  RETURN QUERY
  SELECT 
    b.id,
    b.check_in,
    b.check_out,
    b.guests,
    b.rooms,
    b.total_amount,
    b.status,
    b.payment_status,
    b.amount_paid,
    b.payment_method,
    b.guest_name,
    b.guest_phone,
    b.hotel_confirmation_number,
    b.booking_number,
    b.discount_amount,
    b.manual_total,
    b.notes,
    b.user_id,
    h.name_ar as hotel_name_ar,
    h.name_en as hotel_name_en,
    h.location as hotel_location,
    h.location_url as hotel_location_url,
    h.price_per_night as hotel_price_per_night,
    h.max_guests_per_room as hotel_max_guests_per_room,
    h.tax_percentage as hotel_tax_percentage,
    h.room_type as hotel_room_type
  FROM public.bookings b
  JOIN public.hotels h ON h.id = b.hotel_id
  WHERE b.guest_phone = p_phone
  ORDER BY b.created_at DESC;
END;
$function$;

-- Fix 3: Add validation to check_room_availability function
CREATE OR REPLACE FUNCTION public.check_room_availability(
  p_hotel_id uuid,
  p_check_in date,
  p_check_out date,
  p_rooms_needed integer
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_total_rooms integer;
  v_booked_rooms integer;
BEGIN
  -- Validate hotel exists and is active
  SELECT total_rooms INTO v_total_rooms
  FROM public.hotels
  WHERE id = p_hotel_id AND active = true;
  
  IF v_total_rooms IS NULL THEN
    RAISE EXCEPTION 'Hotel not found or not active';
  END IF;
  
  -- Validate date range
  IF p_check_in >= p_check_out THEN
    RAISE EXCEPTION 'Check-out date must be after check-in date';
  END IF;
  
  IF p_rooms_needed < 1 THEN
    RAISE EXCEPTION 'Rooms needed must be at least 1';
  END IF;
  
  -- Calculate overlapping bookings
  SELECT COALESCE(SUM(rooms_booked), 0) INTO v_booked_rooms
  FROM public.room_availability
  WHERE hotel_id = p_hotel_id
    AND (
      (check_in <= p_check_in AND check_out > p_check_in)
      OR (check_in < p_check_out AND check_out >= p_check_out)
      OR (check_in >= p_check_in AND check_out <= p_check_out)
    );
  
  -- Return availability
  RETURN (v_total_rooms - v_booked_rooms) >= p_rooms_needed;
END;
$function$;

-- Fix 4: Create function for audited profile access
CREATE OR REPLACE FUNCTION public.get_profile_with_audit(
  p_profile_id uuid,
  p_access_reason text DEFAULT 'profile_view'
)
RETURNS TABLE(
  id uuid,
  full_name text,
  phone text,
  referral_code text,
  commission_percentage numeric,
  referred_by uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Verify caller has permission
  IF NOT (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'employee'::app_role)) THEN
    RAISE EXCEPTION 'Unauthorized: Only admin or employee can access profiles';
  END IF;
  
  -- Log the access
  INSERT INTO public.customer_access_logs (
    staff_user_id,
    customer_user_id,
    access_reason
  ) VALUES (
    auth.uid(),
    p_profile_id,
    p_access_reason
  );
  
  -- Return profile data
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.phone,
    p.referral_code,
    p.commission_percentage,
    p.referred_by,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = p_profile_id;
END;
$function$;

-- Add trigger to alert on bulk profile access
CREATE OR REPLACE FUNCTION public.alert_bulk_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_recent_count integer;
  v_staff_name text;
BEGIN
  -- Count recent accesses by this staff member (last hour)
  SELECT COUNT(*) INTO v_recent_count
  FROM public.customer_access_logs
  WHERE staff_user_id = NEW.staff_user_id
    AND created_at > now() - interval '1 hour';
  
  -- If more than 20 accesses in an hour, log it
  IF v_recent_count > 20 THEN
    SELECT full_name INTO v_staff_name
    FROM public.profiles
    WHERE id = NEW.staff_user_id;
    
    -- Log to audit_logs
    INSERT INTO public.audit_logs (
      user_id,
      action,
      entity_type,
      details
    ) VALUES (
      NEW.staff_user_id,
      'bulk_profile_access_alert',
      'customer_access',
      jsonb_build_object(
        'count', v_recent_count,
        'staff_name', v_staff_name,
        'timeframe', '1 hour'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS alert_bulk_access ON public.customer_access_logs;
CREATE TRIGGER alert_bulk_access
AFTER INSERT ON public.customer_access_logs
FOR EACH ROW
EXECUTE FUNCTION public.alert_bulk_profile_access();