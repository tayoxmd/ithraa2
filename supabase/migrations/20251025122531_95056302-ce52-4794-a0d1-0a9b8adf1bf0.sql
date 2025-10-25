-- Create task_activity_log table
CREATE TABLE IF NOT EXISTS public.task_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_activity_log ENABLE ROW LEVEL SECURITY;

-- Staff can view task activity logs
CREATE POLICY "Staff can view task activity logs"
ON public.task_activity_log
FOR SELECT
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'assistant_manager'::app_role, 'employee'::app_role])
);

-- Staff can create task activity logs
CREATE POLICY "Staff can create task activity logs"
ON public.task_activity_log
FOR INSERT
TO authenticated
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'assistant_manager'::app_role, 'employee'::app_role])
  AND user_id = auth.uid()
);

-- Create task categories table for custom categories
CREATE TABLE IF NOT EXISTS public.task_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT DEFAULT 'tag',
  color TEXT DEFAULT '#6b7280',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for task_categories
ALTER TABLE public.task_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view active categories
CREATE POLICY "Everyone can view active categories"
ON public.task_categories
FOR SELECT
TO authenticated
USING (active = true);

-- Staff can manage categories
CREATE POLICY "Staff can manage categories"
ON public.task_categories
FOR ALL
TO authenticated
USING (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'assistant_manager'::app_role])
)
WITH CHECK (
  has_any_role(auth.uid(), ARRAY['admin'::app_role, 'manager'::app_role, 'assistant_manager'::app_role])
);

-- Insert default categories
INSERT INTO public.task_categories (name_ar, name_en, icon, color) VALUES
('عامة', 'General', 'tag', '#6b7280'),
('مالية', 'Financial', 'dollar-sign', '#10b981'),
('حجوزات', 'Bookings', 'calendar', '#3b82f6'),
('دعم', 'Support', 'message-square', '#f59e0b'),
('صيانة', 'Maintenance', 'wrench', '#ef4444')
ON CONFLICT DO NOTHING;