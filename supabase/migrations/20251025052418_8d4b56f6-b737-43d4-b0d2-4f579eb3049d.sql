-- Drop storage policies that depend on user_roles.role
DROP POLICY IF EXISTS "Admins can upload hotel images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update hotel images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete hotel images" ON storage.objects;

-- Add active column first if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles' 
    AND column_name = 'active'
  ) THEN
    ALTER TABLE public.user_roles ADD COLUMN active BOOLEAN DEFAULT true NOT NULL;
  END IF;
END $$;

-- Temporarily change role column to text
ALTER TABLE public.user_roles ALTER COLUMN role TYPE text;

-- Update existing roles to new role names (handle all variations)
UPDATE public.user_roles 
SET role = CASE 
  WHEN role IN ('admin', 'manager') THEN 'manager'
  WHEN role IN ('assistant_manager', 'assistantmanager') THEN 'assistantmanager'
  WHEN role IN ('employee', 'staff') THEN 'staff'
  WHEN role IN ('customer', 'client') THEN 'client'
  ELSE 'client'
END;

-- Drop the old enum type
DROP TYPE IF EXISTS public.app_role CASCADE;

-- Create new enum with updated roles
CREATE TYPE public.app_role AS ENUM (
  'manager',
  'assistantmanager', 
  'staff',
  'visamanager',
  'visaemployee',
  'accountsmanager',
  'accountsemployee',
  'marketingstaff',
  'client',
  'company'
);

-- Convert role column back to enum
ALTER TABLE public.user_roles 
  ALTER COLUMN role TYPE public.app_role USING role::public.app_role;

-- Recreate has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
      AND role = _role
      AND COALESCE(active, true) = true
  )
$$;

-- Create helper function for checking multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
      AND role = ANY(_roles)
      AND COALESCE(active, true) = true
  )
$$;

-- Recreate storage policies with new role names
CREATE POLICY "Managers can upload hotel images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hotel-images' 
  AND public.has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Managers can update hotel images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hotel-images'
  AND public.has_role(auth.uid(), 'manager'::app_role)
);

CREATE POLICY "Managers can delete hotel images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'hotel-images'
  AND public.has_role(auth.uid(), 'manager'::app_role)
);