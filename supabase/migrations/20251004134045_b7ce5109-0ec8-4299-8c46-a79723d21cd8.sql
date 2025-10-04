-- Create storage bucket for hotel images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hotel-images',
  'hotel-images',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for hotel images bucket
CREATE POLICY "Public Access to hotel images"
ON storage.objects FOR SELECT
USING (bucket_id = 'hotel-images');

CREATE POLICY "Admins can upload hotel images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hotel-images' 
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update hotel images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'hotel-images' 
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can delete hotel images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'hotel-images' 
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);