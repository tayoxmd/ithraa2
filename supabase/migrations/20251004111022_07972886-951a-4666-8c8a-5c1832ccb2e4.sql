-- Create PDF settings table
CREATE TABLE IF NOT EXISTS public.pdf_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_logo_url TEXT,
  company_description_ar TEXT,
  company_description_en TEXT,
  terms_ar TEXT,
  terms_en TEXT,
  cancellation_policy_ar TEXT,
  cancellation_policy_en TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  iban TEXT,
  bank_location TEXT,
  responsible_persons JSONB DEFAULT '[]'::jsonb,
  contact_numbers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pdf_settings ENABLE ROW LEVEL SECURITY;

-- Policies for pdf_settings
CREATE POLICY "Admins can manage PDF settings"
  ON public.pdf_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view PDF settings"
  ON public.pdf_settings
  FOR SELECT
  USING (true);

-- Insert default settings
INSERT INTO public.pdf_settings (
  company_description_ar,
  company_description_en,
  terms_ar,
  terms_en,
  cancellation_policy_ar,
  cancellation_policy_en
) VALUES (
  'شركة إثراء للسياحة والسفر',
  'ITHRAA Tourism and Travel Company',
  'يرجى قراءة الشروط والأحكام بعناية قبل إتمام الحجز',
  'Please read the terms and conditions carefully before completing the booking',
  'يمكن إلغاء الحجز قبل 48 ساعة من موعد الوصول',
  'Booking can be cancelled 48 hours before check-in date'
);

-- Create audit logging function
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
$$ LANGUAGE plpgsql SECURITY DEFINER;