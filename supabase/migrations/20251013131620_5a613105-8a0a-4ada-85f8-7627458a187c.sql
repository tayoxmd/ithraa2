-- Add referral system tables and fields

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  commission_earned NUMERIC DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referrer_user_id, referred_user_id)
);

-- Add referral code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES auth.users(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS commission_percentage NUMERIC DEFAULT 10;

-- Add commission fields to hotels
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS commission_type TEXT DEFAULT 'percentage';
ALTER TABLE public.hotels ADD COLUMN IF NOT EXISTS commission_value NUMERIC DEFAULT 0;

-- Add coupon and referral fields to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS referrer_user_id UUID REFERENCES auth.users(id);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
CREATE POLICY "Users can view their own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Admins can view all referrals"
  ON public.referrals FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update referrals"
  ON public.referrals FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to generate referral code for new users
CREATE OR REPLACE FUNCTION assign_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_referral_code();

-- Update existing profiles with referral codes
UPDATE public.profiles
SET referral_code = generate_referral_code()
WHERE referral_code IS NULL;

-- Function to calculate referral commission
CREATE OR REPLACE FUNCTION calculate_referral_commission(
  p_booking_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_booking RECORD;
  v_hotel RECORD;
  v_referrer_profile RECORD;
  v_commission NUMERIC;
BEGIN
  -- Get booking details
  SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id;
  
  IF v_booking.referrer_user_id IS NULL OR v_booking.status != 'confirmed' OR v_booking.payment_status != 'paid' THEN
    RETURN;
  END IF;
  
  -- Get hotel commission settings
  SELECT * INTO v_hotel FROM public.hotels WHERE id = v_booking.hotel_id;
  
  -- Get referrer commission percentage
  SELECT * INTO v_referrer_profile FROM public.profiles WHERE id = v_booking.referrer_user_id;
  
  -- Calculate commission
  IF v_hotel.commission_type = 'fixed' THEN
    v_commission := v_hotel.commission_value;
  ELSE
    v_commission := (v_booking.total_amount * v_hotel.commission_value / 100) * (v_referrer_profile.commission_percentage / 100);
  END IF;
  
  -- Update or insert referral record
  INSERT INTO public.referrals (referrer_user_id, referred_user_id, referral_code, commission_earned, total_bookings)
  VALUES (v_booking.referrer_user_id, v_booking.user_id, v_referrer_profile.referral_code, v_commission, 1)
  ON CONFLICT (referrer_user_id, referred_user_id)
  DO UPDATE SET
    commission_earned = public.referrals.commission_earned + v_commission,
    total_bookings = public.referrals.total_bookings + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to calculate commission on booking status change
CREATE OR REPLACE FUNCTION trigger_commission_calculation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND NEW.payment_status = 'paid' AND 
     (OLD.status != 'confirmed' OR OLD.payment_status != 'paid') THEN
    PERFORM calculate_referral_commission(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER calculate_commission_on_booking
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_commission_calculation();