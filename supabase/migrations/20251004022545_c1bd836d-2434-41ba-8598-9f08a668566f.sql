-- Add social media settings to site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT DEFAULT '+966505731136',
ADD COLUMN IF NOT EXISTS email TEXT DEFAULT 'support@ithraa.com',
ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '0505731136';

-- Create trigger to automatically manage room availability when bookings change
CREATE OR REPLACE FUNCTION public.manage_room_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status IN ('confirmed', 'new', 'pending')) THEN
    -- Add room availability record for new confirmed/pending booking
    INSERT INTO public.room_availability (
      hotel_id,
      booking_id,
      check_in,
      check_out,
      rooms_booked
    ) VALUES (
      NEW.hotel_id,
      NEW.id,
      NEW.check_in,
      NEW.check_out,
      NEW.rooms
    );
    RETURN NEW;
    
  ELSIF (TG_OP = 'UPDATE') THEN
    -- If booking is cancelled or rejected, remove from room_availability
    IF (NEW.status IN ('cancelled', 'rejected') AND OLD.status NOT IN ('cancelled', 'rejected')) THEN
      DELETE FROM public.room_availability WHERE booking_id = NEW.id;
    -- If booking is confirmed from another status, add to room_availability
    ELSIF (NEW.status IN ('confirmed', 'new', 'pending') AND OLD.status NOT IN ('confirmed', 'new', 'pending')) THEN
      INSERT INTO public.room_availability (
        hotel_id,
        booking_id,
        check_in,
        check_out,
        rooms_booked
      ) VALUES (
        NEW.hotel_id,
        NEW.id,
        NEW.check_in,
        NEW.check_out,
        NEW.rooms
      )
      ON CONFLICT (booking_id) DO UPDATE SET
        check_in = EXCLUDED.check_in,
        check_out = EXCLUDED.check_out,
        rooms_booked = EXCLUDED.rooms_booked;
    -- If dates or rooms changed, update room_availability
    ELSIF (NEW.status IN ('confirmed', 'new', 'pending')) THEN
      UPDATE public.room_availability SET
        check_in = NEW.check_in,
        check_out = NEW.check_out,
        rooms_booked = NEW.rooms
      WHERE booking_id = NEW.id;
    END IF;
    RETURN NEW;
    
  ELSIF (TG_OP = 'DELETE') THEN
    -- Remove from room_availability when booking is deleted
    DELETE FROM public.room_availability WHERE booking_id = OLD.id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS manage_room_availability_trigger ON public.bookings;

-- Create trigger for automatic room availability management
CREATE TRIGGER manage_room_availability_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.manage_room_availability();

-- Add unique constraint to room_availability to prevent duplicate bookings
ALTER TABLE public.room_availability
DROP CONSTRAINT IF EXISTS room_availability_booking_id_key;

ALTER TABLE public.room_availability
ADD CONSTRAINT room_availability_booking_id_key UNIQUE (booking_id);