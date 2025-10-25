-- Add task_visible_roles column to site_settings
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS task_visible_roles jsonb DEFAULT '["admin", "manager", "assistant_manager", "employee"]'::jsonb;

COMMENT ON COLUMN public.site_settings.task_visible_roles IS 'Array of role names that can see the "My Tasks" button';
