-- Create guests table for user's saved guests
CREATE TABLE IF NOT EXISTS public.user_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  guest_country_code TEXT DEFAULT '+966',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_guests ENABLE ROW LEVEL SECURITY;

-- Users can view their own guests
CREATE POLICY "Users can view their own guests"
ON public.user_guests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own guests
CREATE POLICY "Users can insert their own guests"
ON public.user_guests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own guests
CREATE POLICY "Users can update their own guests"
ON public.user_guests
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own guests
CREATE POLICY "Users can delete their own guests"
ON public.user_guests
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_guests_user_id ON public.user_guests(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_guests_updated_at
BEFORE UPDATE ON public.user_guests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();