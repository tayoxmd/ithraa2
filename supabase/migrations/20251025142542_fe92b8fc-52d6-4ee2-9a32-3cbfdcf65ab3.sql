-- =========================================
-- Security Fix: Add Missing RLS Policies
-- =========================================

-- 1. api_settings policies
CREATE POLICY "Admins can manage API settings"
  ON public.api_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can view API settings"
  ON public.api_settings FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

-- 2. financial_transactions policies
CREATE POLICY "Financial staff can view transactions"
  ON public.financial_transactions FOR SELECT
  USING (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'specific_financial_manager'::app_role])
    AND NOT soft_deleted
  );

CREATE POLICY "Financial managers can insert transactions"
  ON public.financial_transactions FOR INSERT
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'specific_financial_manager'::app_role])
    AND created_by = auth.uid()
  );

CREATE POLICY "Financial managers can soft delete"
  ON public.financial_transactions FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'specific_financial_manager'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'specific_financial_manager'::app_role]));

-- 3. chat_sessions policies
CREATE POLICY "Users can view their sessions"
  ON public.chat_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Staff can view all sessions"
  ON public.chat_sessions FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'employee'::app_role]));

CREATE POLICY "Staff can update sessions"
  ON public.chat_sessions FOR UPDATE
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'employee'::app_role]));

-- 4. employee_salaries policies
CREATE POLICY "Admins can manage salaries"
  ON public.employee_salaries FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

-- 5. customer_access_logs policies
CREATE POLICY "Staff can insert access logs"
  ON public.customer_access_logs FOR INSERT
  WITH CHECK (
    has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'employee'::app_role])
    AND staff_user_id = auth.uid()
  );

CREATE POLICY "Admins can view access logs"
  ON public.customer_access_logs FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

-- 6. pdf_settings policies
CREATE POLICY "Admins can manage PDF settings"
  ON public.pdf_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view PDF settings"
  ON public.pdf_settings FOR SELECT
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'employee'::app_role]));

-- 7. hotel_owners policies
CREATE POLICY "Staff can manage hotel owners"
  ON public.hotel_owners FOR ALL
  USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]))
  WITH CHECK (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role]));

-- =========================================
-- Security Fix: Guest Booking Access
-- Replace session variable with guest_verifications table
-- =========================================

-- Drop the insecure policy
DROP POLICY IF EXISTS "Verified guests view own bookings" ON public.bookings;

-- Create secure policy using guest_verifications table
CREATE POLICY "Verified guests view own bookings"
  ON public.bookings FOR SELECT
  USING (
    user_id IS NULL
    AND guest_phone_hash IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.guest_verifications
      WHERE phone_hash = bookings.guest_phone_hash
        AND verified = true
        AND verified_at > now() - interval '7 days'
    )
  );

-- Update get_guest_bookings function to remove session variable usage
CREATE OR REPLACE FUNCTION public.get_guest_bookings(p_phone text)
RETURNS TABLE(
  id uuid, check_in date, check_out date, guests integer, rooms integer,
  total_amount numeric, status booking_status, payment_status payment_status,
  amount_paid numeric, payment_method text, guest_name text, guest_phone text,
  hotel_confirmation_number text, booking_number integer, discount_amount numeric,
  manual_total numeric, notes text, user_id uuid, hotel_name_ar text,
  hotel_name_en text, hotel_location text, hotel_location_url text,
  hotel_price_per_night numeric, hotel_max_guests_per_room integer,
  hotel_tax_percentage numeric, hotel_room_type room_type
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    AND verified_at > now() - interval '7 days'
  LIMIT 1;
  
  IF NOT COALESCE(v_verified, false) THEN
    RAISE EXCEPTION 'Phone number not verified or verification expired';
  END IF;
  
  -- Return bookings directly without session variable
  RETURN QUERY
  SELECT 
    b.id, b.check_in, b.check_out, b.guests, b.rooms, b.total_amount,
    b.status, b.payment_status, b.amount_paid, b.payment_method,
    b.guest_name, b.guest_phone, b.hotel_confirmation_number,
    b.booking_number, b.discount_amount, b.manual_total, b.notes,
    b.user_id,
    h.name_ar as hotel_name_ar, h.name_en as hotel_name_en,
    h.location as hotel_location, h.location_url as hotel_location_url,
    h.price_per_night as hotel_price_per_night,
    h.max_guests_per_room as hotel_max_guests_per_room,
    h.tax_percentage as hotel_tax_percentage,
    h.room_type as hotel_room_type
  FROM public.bookings b
  JOIN public.hotels h ON h.id = b.hotel_id
  WHERE b.guest_phone_hash = v_phone_hash
  ORDER BY b.created_at DESC;
END;
$$;