-- Fix bookings table security vulnerability
-- The previous "Block anonymous access to bookings" policy was too permissive
-- It allowed ANY authenticated user to read ALL bookings, which is a security risk

-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Block anonymous access to bookings" ON public.bookings;

-- The existing policies are sufficient and secure:
-- 1. "Users can view their own bookings" - allows users to see only their own bookings
-- 2. "Admins can view all bookings" - allows admins full visibility
-- 
-- These policies already:
-- - Block anonymous (unauthenticated) access
-- - Prevent users from viewing other users' bookings and payment information
-- - Allow admins and employees appropriate access levels