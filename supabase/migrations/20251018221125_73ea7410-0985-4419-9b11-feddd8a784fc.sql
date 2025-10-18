-- Create studio storage bucket for admin files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'studio-files',
  'studio-files',
  false,
  524288000, -- 500MB limit
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm'
  ]
);

-- RLS Policy: Only admins can upload files
CREATE POLICY "Admins can upload studio files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'studio-files' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- RLS Policy: Only admins can view files
CREATE POLICY "Admins can view studio files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'studio-files' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- RLS Policy: Only admins can update files
CREATE POLICY "Admins can update studio files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'studio-files' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- RLS Policy: Only admins can delete files
CREATE POLICY "Admins can delete studio files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'studio-files' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);