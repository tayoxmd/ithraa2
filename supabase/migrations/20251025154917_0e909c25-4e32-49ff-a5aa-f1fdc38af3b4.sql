-- Fix: Add task_activity_log table for tracking changes
CREATE TABLE IF NOT EXISTS public.task_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  old_value text,
  new_value text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on task_activity_log
ALTER TABLE public.task_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Staff can view activity logs
CREATE POLICY "Staff can view activity logs"
ON public.task_activity_log
FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'assistant_manager'::app_role, 'employee'::app_role]));

-- Policy: System can insert activity logs
CREATE POLICY "System can insert activity logs"
ON public.task_activity_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add financial task types
ALTER TYPE task_type ADD VALUE IF NOT EXISTS 'receipt_voucher';
ALTER TYPE task_type ADD VALUE IF NOT EXISTS 'payment_voucher';