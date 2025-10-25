-- Add specific_financial_manager and visa_manager to app_role enum
-- Drop existing enum constraint and recreate with new values
DO $$ 
BEGIN
  -- Check if the enum values don't exist already
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'specific_financial_manager' 
    AND enumtypid = 'public.app_role'::regtype
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'specific_financial_manager';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'visa_manager' 
    AND enumtypid = 'public.app_role'::regtype
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'visa_manager';
  END IF;
END $$;

-- Create task_full_access_users table to control who can see full task dashboard
CREATE TABLE IF NOT EXISTS public.task_full_access_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS on task_full_access_users
ALTER TABLE public.task_full_access_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_full_access_users
CREATE POLICY "Managers can manage full access users"
ON public.task_full_access_users
FOR ALL
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role])
)
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role])
);

CREATE POLICY "Users can view their own access status"
ON public.task_full_access_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create task_sharing_settings table for email/whatsapp notifications
CREATE TABLE IF NOT EXISTS public.task_sharing_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_via_email boolean DEFAULT false,
  share_via_whatsapp boolean DEFAULT false,
  share_via_whatsapp_group boolean DEFAULT false,
  whatsapp_group_link text,
  notify_on_create boolean DEFAULT true,
  notify_on_update boolean DEFAULT true,
  notify_on_status_change boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on task_sharing_settings
ALTER TABLE public.task_sharing_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_sharing_settings
CREATE POLICY "Managers can manage sharing settings"
ON public.task_sharing_settings
FOR ALL
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'assistant_manager'::app_role])
)
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'assistant_manager'::app_role])
);

-- Insert default sharing settings
INSERT INTO public.task_sharing_settings (id, share_via_email, share_via_whatsapp)
VALUES (gen_random_uuid(), false, false)
ON CONFLICT DO NOTHING;

-- Add description column to tasks if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tasks' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.tasks ADD COLUMN description text;
  END IF;
END $$;