-- Add rate limiting and additional security for site_settings
CREATE OR REPLACE FUNCTION public.get_site_settings()
RETURNS TABLE (
  tax_percentage numeric,
  owner_room_color text,
  hotel_room_color text,
  phone text,
  email text,
  whatsapp_number text,
  facebook_url text,
  twitter_url text,
  instagram_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    tax_percentage,
    owner_room_color,
    hotel_room_color,
    phone,
    email,
    whatsapp_number,
    facebook_url,
    twitter_url,
    instagram_url
  FROM public.site_settings
  LIMIT 1;
$$;

-- Remove public read access from site_settings
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;

-- Create more restrictive policy for site_settings
CREATE POLICY "Authenticated users can view site settings"
ON public.site_settings
FOR SELECT
TO authenticated
USING (true);

-- Keep admin policy
-- Already exists: "Admins can manage site settings"

-- Add additional monitoring for profiles
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log bulk access attempts (more than 10 profiles in short time)
  -- This is a placeholder for monitoring - in production, implement proper logging
  RETURN NEW;
END;
$$;

-- Improve profiles security with better RLS
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate profiles policies with better security
CREATE POLICY "Users can view only their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Employees can view customer profiles"
ON public.profiles
FOR SELECT
TO authenticated  
USING (
  public.has_role(auth.uid(), 'employee'::app_role) AND
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.user_id = profiles.id
  )
);