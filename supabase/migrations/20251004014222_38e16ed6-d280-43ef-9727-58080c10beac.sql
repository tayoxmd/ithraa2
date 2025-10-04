-- Fix profiles table security vulnerability
-- The previous "Block anonymous access to profiles" policy was too permissive
-- It allowed ANY authenticated user to read ALL profiles, which is a security risk

-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;

-- The existing policies are sufficient and secure:
-- 1. "Users can view their own profile" - allows users to see only their own data
-- 2. "Admins can view all profiles" - allows admins to manage user profiles
-- 
-- No additional policies needed - the existing ones already:
-- - Block anonymous (unauthenticated) access
-- - Prevent users from viewing other users' profiles
-- - Allow admins full access for legitimate administrative purposes