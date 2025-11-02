-- Create page_builder_data table for page builder functionality
CREATE TABLE IF NOT EXISTS public.page_builder_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_type TEXT NOT NULL DEFAULT 'homepage',
  elements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(page_type)
);

-- Enable ROW LEVEL SECURITY
ALTER TABLE public.page_builder_data ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage page builder data
CREATE POLICY "Admins can manage page builder data"
ON public.page_builder_data
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create policy for reading page builder data (public read)
CREATE POLICY "Anyone can read page builder data"
ON public.page_builder_data
FOR SELECT
USING (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_page_builder_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_page_builder_data_updated_at
BEFORE UPDATE ON public.page_builder_data
FOR EACH ROW
EXECUTE FUNCTION update_page_builder_data_updated_at();

