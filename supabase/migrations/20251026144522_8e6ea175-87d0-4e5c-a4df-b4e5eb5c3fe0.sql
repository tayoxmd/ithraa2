-- Create table for basic task viewing access
CREATE TABLE IF NOT EXISTS public.task_basic_access_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  granted_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_basic_access_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage basic access users"
ON public.task_basic_access_users
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own basic access status"
ON public.task_basic_access_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_task_basic_access_user_id ON public.task_basic_access_users(user_id);