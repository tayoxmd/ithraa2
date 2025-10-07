-- Add pinned_to_homepage column to hotels table
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS pinned_to_homepage BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_hotels_pinned_to_homepage ON public.hotels(pinned_to_homepage);