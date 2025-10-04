-- Drop the existing payment_status column if it's text
ALTER TABLE public.bookings 
  DROP COLUMN IF EXISTS payment_status;

-- Create payment status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('paid', 'partially_paid', 'unpaid');
  END IF;
END $$;

-- Add payment_status as enum
ALTER TABLE public.bookings 
  ADD COLUMN payment_status payment_status DEFAULT 'unpaid'::payment_status;

-- Add amount_paid column
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_role text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all logs
CREATE POLICY "Admins can view all logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy for users to view their own logs
CREATE POLICY "Users can view their own logs"
ON public.audit_logs
FOR SELECT
USING (user_id = auth.uid());

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);