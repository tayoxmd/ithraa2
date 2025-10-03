-- Add extra guest pricing fields to hotels table
ALTER TABLE public.hotels 
ADD COLUMN max_guests_per_room integer NOT NULL DEFAULT 2,
ADD COLUMN extra_guest_price numeric NOT NULL DEFAULT 0;

-- Update existing hotels with default values
UPDATE public.hotels 
SET max_guests_per_room = 2, extra_guest_price = 0 
WHERE max_guests_per_room IS NULL OR extra_guest_price IS NULL;