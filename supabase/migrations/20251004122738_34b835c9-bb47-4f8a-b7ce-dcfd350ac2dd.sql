-- Critical Security Fixes

-- 1. Drop safe_audit_logs VIEW if it exists
DROP VIEW IF EXISTS public.safe_audit_logs CASCADE;

-- 2. Restrict PDF settings to admin only (not employees)
DROP POLICY IF EXISTS "Admins and employees can view PDF settings" ON public.pdf_settings;

CREATE POLICY "Only admins can view PDF settings" 
ON public.pdf_settings 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can manage PDF settings" 
ON public.pdf_settings 
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Ensure hotels table doesn't expose contact information in the RLS policy
-- The get_public_hotels function already excludes contact_person and contact_phone
-- but let's add a comment to remind developers
COMMENT ON COLUMN public.hotels.contact_person IS 'SENSITIVE: Contact person name. Should only be accessible to admin/employee roles. Never expose in public functions.';
COMMENT ON COLUMN public.hotels.contact_phone IS 'SENSITIVE: Contact phone number. Should only be accessible to admin/employee roles. Never expose in public functions.';

-- 4. Add explicit policies for complaints to ensure users can only see their own
DROP POLICY IF EXISTS "Users can view only their own complaints" ON public.complaints;

CREATE POLICY "Users can view only their own complaints" 
ON public.complaints 
FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'employee'::app_role));

-- 5. Add admin-only function to get hotel contact information
CREATE OR REPLACE FUNCTION public.get_hotel_contacts(p_hotel_id uuid)
RETURNS TABLE(
  contact_person text,
  contact_phone text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Only allow admins and employees to access contact information
  SELECT 
    contact_person,
    contact_phone
  FROM public.hotels
  WHERE id = p_hotel_id
    AND (
      public.has_role(auth.uid(), 'admin'::app_role) 
      OR public.has_role(auth.uid(), 'employee'::app_role)
    );
$$;

COMMENT ON FUNCTION public.get_hotel_contacts IS 'Admin/Employee only: Retrieves hotel contact information. Never call from public-facing pages.';