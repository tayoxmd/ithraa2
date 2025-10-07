-- Phase 1: CRITICAL Security Fixes

-- 1. Fix Bookings RLS Policy - Remove vulnerable broad policy
DROP POLICY IF EXISTS "Users and guests can view their bookings" ON public.bookings;

-- Create specific, secure policies for bookings
CREATE POLICY "Users view own bookings" ON public.bookings 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Staff view all bookings" ON public.bookings 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'employee'::app_role)
);

-- Guest bookings will require phone verification (implemented in code)
CREATE POLICY "Verified guests view own bookings" ON public.bookings 
FOR SELECT 
USING (
  user_id IS NULL AND 
  guest_phone IS NOT NULL AND
  guest_phone = current_setting('app.verified_guest_phone', true)
);

-- 2. Prevent Privilege Escalation
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Recreate admin policy with proper scope
CREATE POLICY "Admins can manage all roles" ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Prevent users from modifying their own roles
CREATE POLICY "Prevent self role modification" ON public.user_roles 
FOR UPDATE 
USING (user_id != auth.uid());

CREATE POLICY "Prevent self role deletion" ON public.user_roles 
FOR DELETE 
USING (user_id != auth.uid());

-- 3. Create guest verification table for OTP
CREATE TABLE IF NOT EXISTS public.guest_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_hash text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  verified_at timestamp with time zone
);

ALTER TABLE public.guest_verifications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to verify OTP
CREATE POLICY "Anyone can verify OTP" ON public.guest_verifications 
FOR SELECT 
USING (expires_at > now() AND NOT verified);

-- 4. Add audit logging for customer data access
CREATE TABLE IF NOT EXISTS public.customer_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_user_id uuid REFERENCES auth.users(id),
  customer_user_id uuid REFERENCES auth.users(id),
  access_reason text,
  ip_address text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.customer_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view access logs" ON public.customer_access_logs 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can insert access logs" ON public.customer_access_logs 
FOR INSERT 
WITH CHECK (
  staff_user_id = auth.uid() AND
  (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'employee'::app_role))
);

-- 5. Restrict Employee Profile Access
DROP POLICY IF EXISTS "Employees can view customer profiles" ON public.profiles;

-- Create security definer function to check if employee is assigned to customer's hotels
CREATE OR REPLACE FUNCTION public.employee_has_assigned_customer(employee_id uuid, customer_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.hotel_responsible_persons hrp
    INNER JOIN public.bookings b ON b.hotel_id = hrp.hotel_id
    WHERE hrp.employee_id = employee_id
      AND b.user_id = customer_id
  )
$$;

-- Only allow employees to view profiles of customers with bookings at their assigned hotels
CREATE POLICY "Employees view assigned customer profiles" ON public.profiles 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'employee'::app_role) AND 
  public.employee_has_assigned_customer(auth.uid(), id)
);

-- 6. Financial Transaction Immutability
DROP POLICY IF EXISTS "Admins can manage financial transactions" ON public.financial_transactions;

-- Add soft delete column
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS soft_deleted boolean DEFAULT false;

-- Create separate policies (no DELETE permission)
CREATE POLICY "Admins can view transactions" ON public.financial_transactions 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert transactions" ON public.financial_transactions 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update transactions" ON public.financial_transactions 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Prevent deletion entirely
CREATE POLICY "Prevent transaction deletion" ON public.financial_transactions 
FOR DELETE 
USING (false);

-- Create index for soft deletes
CREATE INDEX IF NOT EXISTS idx_financial_soft_deleted ON public.financial_transactions(soft_deleted) WHERE NOT soft_deleted;

-- 7. Add phone hash column to bookings for future hashing implementation
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS guest_phone_hash text;
CREATE INDEX IF NOT EXISTS idx_guest_phone_hash ON public.bookings(guest_phone_hash);

-- 8. Enhanced audit logging - add more sensitive fields to sanitization
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action text,
  p_entity_type text,
  p_entity_id uuid DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
  v_sanitized_details JSONB;
BEGIN
  v_user_id := auth.uid();
  
  SELECT role INTO v_user_role
  FROM public.user_roles
  WHERE user_id = v_user_id
  LIMIT 1;
  
  -- Enhanced sanitization - remove more sensitive fields
  IF p_details IS NOT NULL THEN
    v_sanitized_details := p_details - ARRAY[
      'password', 'token', 'api_key', 'secret', 'private_key', 
      'access_token', 'refresh_token', 'credit_card', 'cvv',
      'bank_account', 'ssn', 'id_number'
    ];
    -- Keep email/phone for profile-related actions, remove for others
    IF p_action NOT LIKE '%profile%' AND p_action NOT LIKE '%view%' THEN
      v_sanitized_details := v_sanitized_details - ARRAY['email', 'phone', 'guest_phone', 'contact_phone'];
    END IF;
  ELSE
    v_sanitized_details := NULL;
  END IF;
  
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