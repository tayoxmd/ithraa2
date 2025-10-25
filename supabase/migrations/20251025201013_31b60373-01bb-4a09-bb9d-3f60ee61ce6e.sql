-- Ensure RLS is enabled on critical tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policy helper to conditionally create policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Admins can view user roles'
  ) THEN
    CREATE POLICY "Admins can view user roles"
    ON public.user_roles
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Admins can update user roles'
  ) THEN
    CREATE POLICY "Admins can update user roles"
    ON public.user_roles
    FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins can view profiles'
  ) THEN
    CREATE POLICY "Admins can view profiles"
    ON public.profiles
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins can update profiles'
  ) THEN
    CREATE POLICY "Admins can update profiles"
    ON public.profiles
    FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'::app_role))
    WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
  END IF;
END$$;

-- Allow staff to update bookings (status, payment, etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Staff can update bookings'
  ) THEN
    CREATE POLICY "Staff can update bookings"
    ON public.bookings
    FOR UPDATE
    USING (
      public.has_any_role(
        auth.uid(), 
        ARRAY[
          'admin'::app_role,
          'manager'::app_role,
          'assistant_manager'::app_role,
          'employee'::app_role,
          'specific_financial_manager'::app_role,
          'specific_financial_employee'::app_role,
          'visa_manager'::app_role,
          'visa_employee'::app_role
        ]
      )
    )
    WITH CHECK (
      public.has_any_role(
        auth.uid(), 
        ARRAY[
          'admin'::app_role,
          'manager'::app_role,
          'assistant_manager'::app_role,
          'employee'::app_role,
          'specific_financial_manager'::app_role,
          'specific_financial_employee'::app_role,
          'visa_manager'::app_role,
          'visa_employee'::app_role
        ]
      )
    );
  END IF;
END$$;