-- Add hotel_confirmation_number and booking_number to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS hotel_confirmation_number TEXT,
ADD COLUMN IF NOT EXISTS booking_number SERIAL;

-- Add index for booking_number for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON public.bookings(booking_number);

-- Add index for hotel_confirmation_number
CREATE INDEX IF NOT EXISTS idx_bookings_hotel_confirmation_number ON public.bookings(hotel_confirmation_number);

-- Update existing bookings to have booking numbers if they don't have them
-- This will assign sequential numbers to existing bookings based on created_at
DO $$
DECLARE
  booking_record RECORD;
  counter INTEGER := 1;
BEGIN
  FOR booking_record IN 
    SELECT id FROM public.bookings 
    WHERE booking_number IS NULL 
    ORDER BY created_at ASC
  LOOP
    UPDATE public.bookings 
    SET booking_number = counter 
    WHERE id = booking_record.id;
    counter := counter + 1;
  END LOOP;
END $$;