-- Create anon insert policy for guest bookings if it does not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'bookings' 
      AND policyname = 'Anon can insert guest bookings'
  ) THEN
    CREATE POLICY "Anon can insert guest bookings"
    ON public.bookings
    FOR INSERT
    TO anon
    WITH CHECK (
      user_id IS NULL
      AND guest_phone IS NOT NULL
    );
  END IF;
END $$;