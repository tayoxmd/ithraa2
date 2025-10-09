-- Enable Row Level Security on api_settings table
ALTER TABLE public.api_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Only admins can manage API settings" ON public.api_settings;
DROP POLICY IF EXISTS "Admins can manage API settings" ON public.api_settings;
DROP POLICY IF EXISTS "Only admins can view API requests" ON public.api_requests;

-- Create policy for admins to manage API settings (all operations)
CREATE POLICY "Admins can manage API settings"
ON public.api_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Ensure RLS is enabled on api_requests table as well
ALTER TABLE public.api_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view API requests
CREATE POLICY "Admins can view API requests"
ON public.api_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));