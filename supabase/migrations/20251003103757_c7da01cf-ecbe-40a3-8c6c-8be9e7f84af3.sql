-- Add new fields to hotels table
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS total_rooms integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS responsible_person_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS tax_percentage numeric DEFAULT 15;

-- Add comment for clarity
COMMENT ON COLUMN public.hotels.total_rooms IS 'Total number of rooms available in the hotel';
COMMENT ON COLUMN public.hotels.responsible_person_id IS 'ID of the employee/admin responsible for this hotel';
COMMENT ON COLUMN public.hotels.tax_percentage IS 'Tax percentage applied to bookings (default 15%)';