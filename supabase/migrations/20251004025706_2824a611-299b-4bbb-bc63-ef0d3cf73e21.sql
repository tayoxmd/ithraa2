
-- Add room_type enum for hotels
CREATE TYPE public.room_type AS ENUM ('hotel_rooms', 'owner_rooms');

-- Add room_type column to hotels table
ALTER TABLE public.hotels
ADD COLUMN room_type public.room_type DEFAULT 'hotel_rooms';

-- Add discount and manual total columns to bookings table
ALTER TABLE public.bookings
ADD COLUMN discount_amount numeric DEFAULT 0,
ADD COLUMN manual_total numeric DEFAULT NULL;

-- Comment on new columns
COMMENT ON COLUMN public.hotels.room_type IS 'Type of rooms: hotel_rooms (غرف فندقية) or owner_rooms (غرف مُلّاك)';
COMMENT ON COLUMN public.bookings.discount_amount IS 'Discount amount applied to the booking';
COMMENT ON COLUMN public.bookings.manual_total IS 'Manually entered total amount (overrides calculated total)';
