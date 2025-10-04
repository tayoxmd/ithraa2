-- Security Hardening: Additional RLS Protection

-- 1. Add explicit policy to deny unauthenticated access to profiles
-- First, ensure no public access exists
DO $$ 
BEGIN
  -- Remove any potential public access policies if they exist
  DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
END $$;

-- Create explicit deny policy for unauthenticated users
CREATE POLICY "Deny unauthenticated access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- 2. Add explicit policy to deny unauthenticated access to bookings
DO $$ 
BEGIN
  -- Remove any potential public access policies if they exist
  DROP POLICY IF EXISTS "Public can view bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;
END $$;

-- Create explicit deny policy for unauthenticated users
CREATE POLICY "Deny unauthenticated access to bookings"
ON public.bookings
FOR ALL
TO anon
USING (false);

-- 3. Add policy to restrict audit logs from exposing sensitive data
-- Create a view that sanitizes sensitive information
CREATE OR REPLACE VIEW public.safe_audit_logs AS
SELECT 
  id,
  user_id,
  user_role,
  action,
  entity_type,
  entity_id,
  created_at,
  -- Filter out sensitive keys from details JSONB
  CASE 
    WHEN details IS NOT NULL THEN
      details - ARRAY['password', 'token', 'api_key', 'secret', 'private_key', 'access_token', 'refresh_token']
    ELSE NULL
  END as details
FROM public.audit_logs;

-- Grant access to the safe view
GRANT SELECT ON public.safe_audit_logs TO authenticated;

-- 4. Update the log_audit_event function to sanitize input
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action text,
  p_entity_type text,
  p_entity_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_sanitized_details JSONB;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Get user role
  SELECT role INTO v_user_role
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;
  
  -- Sanitize details by removing sensitive keys
  IF p_details IS NOT NULL THEN
    v_sanitized_details := p_details - ARRAY['password', 'token', 'api_key', 'secret', 'private_key', 'access_token', 'refresh_token', 'email', 'phone'];
  ELSE
    v_sanitized_details := NULL;
  END IF;
  
  -- Insert audit log with sanitized details
  INSERT INTO public.audit_logs (
    user_id,
    user_role,
    action,
    entity_type,
    entity_id,
    details
  ) VALUES (
    v_user_id,
    v_user_role,
    p_action,
    p_entity_type,
    p_entity_id,
    v_sanitized_details
  );
END;
$$;

-- 5. Add comment to remind about security
COMMENT ON FUNCTION public.log_audit_event IS 'Logs audit events with automatic sanitization of sensitive data. Never log passwords, tokens, or personal identifiable information.';

-- 6. Ensure complaints table has proper authentication requirements
DO $$ 
BEGIN
  -- Remove overly permissive anonymous policy if exists
  DROP POLICY IF EXISTS "Anonymous users can submit complaints" ON public.complaints;
END $$;

-- Create policy that requires authenticated users for complaints
CREATE POLICY "Authenticated users can submit complaints"
ON public.complaints
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());