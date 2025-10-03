-- Add rooms column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN rooms integer NOT NULL DEFAULT 1;

-- Add comment to explain the column
COMMENT ON COLUMN public.bookings.rooms IS 'Number of rooms booked';