-- Add amenities fields to hotels table
ALTER TABLE public.hotels 
ADD COLUMN IF NOT EXISTS amenities jsonb DEFAULT '{
  "wifi": true,
  "cafe": false,
  "restaurant": false,
  "parking": false,
  "shuttle": false,
  "walking_distance": null,
  "walking_distance_unit": "m"
}'::jsonb;

COMMENT ON COLUMN public.hotels.amenities IS 'Hotel amenities and facilities with walking distance info';
