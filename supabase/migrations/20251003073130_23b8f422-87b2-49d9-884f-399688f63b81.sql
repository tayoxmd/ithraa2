-- Add location_url column to hotels table for Google Maps links
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS location_url TEXT;