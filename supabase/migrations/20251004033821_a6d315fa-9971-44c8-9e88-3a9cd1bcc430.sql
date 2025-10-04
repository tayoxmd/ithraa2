-- Add 'rejected' to booking_status enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'booking_status' AND e.enumlabel = 'rejected'
  ) THEN
    ALTER TYPE public.booking_status ADD VALUE 'rejected';
  END IF;
END $$;

-- Add customizable highlight colors to site_settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS owner_room_color text DEFAULT '#e0f2fe',
  ADD COLUMN IF NOT EXISTS hotel_room_color text DEFAULT NULL;