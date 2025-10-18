-- Add bed type options for 2-guest rooms
-- Note: bed_type_double column already exists, this migration adds constraints
ALTER TABLE public.hotels 
  ADD CONSTRAINT check_bed_type_valid 
  CHECK (bed_type_double IN ('king', 'twin', 'double'));

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_hotels_bed_type ON public.hotels(bed_type_double) WHERE max_guests_per_room = 2;