-- First update any 'double' values to 'king'
UPDATE public.hotels 
SET bed_type_double = 'king' 
WHERE bed_type_double = 'double';

-- Add bed type fields for 3 and 4 guests
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS bed_type_three text DEFAULT 'single',
ADD COLUMN IF NOT EXISTS bed_type_four text DEFAULT 'single';

-- Update bed_type_double constraint to only allow twin or king
ALTER TABLE public.hotels 
DROP CONSTRAINT IF EXISTS hotels_bed_type_double_check;

ALTER TABLE public.hotels 
ADD CONSTRAINT hotels_bed_type_double_check CHECK (bed_type_double IN ('twin', 'king'));

ALTER TABLE public.hotels 
ADD CONSTRAINT hotels_bed_type_three_check CHECK (bed_type_three = 'single');

ALTER TABLE public.hotels 
ADD CONSTRAINT hotels_bed_type_four_check CHECK (bed_type_four = 'single');

COMMENT ON COLUMN public.hotels.bed_type_three IS 'Bed type for 3 guests: always 3 single beds';
COMMENT ON COLUMN public.hotels.bed_type_four IS 'Bed type for 4 guests: always 4 single beds';