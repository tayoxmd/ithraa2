-- Fix function search path security warning
DROP FUNCTION IF EXISTS public.log_audit_event(TEXT, TEXT, UUID, JSONB);

CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  -- Get user role
  SELECT role INTO v_user_role
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;
  
  -- Insert audit log
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
    p_details
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;