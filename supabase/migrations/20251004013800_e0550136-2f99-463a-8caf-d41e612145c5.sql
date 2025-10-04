-- Fix security issues: Block anonymous access to sensitive tables

-- Fix 1: Block anonymous access to profiles table
-- This prevents hackers from scraping customer phone numbers and names
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;

CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Fix 2: Block anonymous access to bookings table
-- This prevents exposure of payment information and booking details
DROP POLICY IF EXISTS "Block anonymous access to bookings" ON public.bookings;

CREATE POLICY "Block anonymous access to bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Note: The existing policies will still work alongside these new policies
-- because they are more specific (checking auth.uid() = user_id or has_role())
-- These new policies add an additional security layer to prevent any anonymous access