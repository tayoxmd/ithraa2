-- Allow anonymous complaints by making user_id nullable
ALTER TABLE public.complaints ALTER COLUMN user_id DROP NOT NULL;

-- Add RLS policy for anonymous complaints
CREATE POLICY "Anonymous users can submit complaints"
ON public.complaints
FOR INSERT
WITH CHECK (
  -- Allow if user is authenticated OR if user_id is the special anonymous UUID
  auth.uid() IS NOT NULL OR user_id = '00000000-0000-0000-0000-000000000000'
);

-- Update existing policy to allow viewing anonymous complaints
DROP POLICY IF EXISTS "Users can view their own complaints" ON public.complaints;

CREATE POLICY "Users can view their own complaints"
ON public.complaints
FOR SELECT
USING (
  user_id = auth.uid() OR 
  user_id = '00000000-0000-0000-0000-000000000000'
);