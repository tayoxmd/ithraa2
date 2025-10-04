-- Create site_settings table for global tax settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_percentage numeric NOT NULL DEFAULT 15,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Admins can manage site settings
CREATE POLICY "Admins can manage site settings"
ON public.site_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Everyone can view site settings
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Insert default settings
INSERT INTO public.site_settings (tax_percentage) VALUES (15);

-- Create hotel_responsible_persons junction table (many-to-many)
CREATE TABLE IF NOT EXISTS public.hotel_responsible_persons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(hotel_id, employee_id)
);

-- Enable RLS
ALTER TABLE public.hotel_responsible_persons ENABLE ROW LEVEL SECURITY;

-- Admins can manage
CREATE POLICY "Admins can manage hotel responsible persons"
ON public.hotel_responsible_persons
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Employees can view their assigned hotels
CREATE POLICY "Employees can view their assignments"
ON public.hotel_responsible_persons
FOR SELECT
USING (employee_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Create room_availability table to track bookings by date
CREATE TABLE IF NOT EXISTS public.room_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE NOT NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  rooms_booked integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.room_availability ENABLE ROW LEVEL SECURITY;

-- Admins and employees can manage
CREATE POLICY "Admins and employees can manage room availability"
ON public.room_availability
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'employee'::app_role));

-- Create index for faster date range queries
CREATE INDEX idx_room_availability_dates ON public.room_availability(hotel_id, check_in, check_out);

-- Add trigger for updated_at on site_settings
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check room availability
CREATE OR REPLACE FUNCTION public.check_room_availability(
  p_hotel_id uuid,
  p_check_in date,
  p_check_out date,
  p_rooms_needed integer
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_rooms integer;
  v_booked_rooms integer;
BEGIN
  -- Get total rooms for hotel
  SELECT total_rooms INTO v_total_rooms
  FROM public.hotels
  WHERE id = p_hotel_id;
  
  -- Calculate overlapping bookings
  SELECT COALESCE(SUM(rooms_booked), 0) INTO v_booked_rooms
  FROM public.room_availability
  WHERE hotel_id = p_hotel_id
    AND (
      (check_in <= p_check_in AND check_out > p_check_in)
      OR (check_in < p_check_out AND check_out >= p_check_out)
      OR (check_in >= p_check_in AND check_out <= p_check_out)
    );
  
  -- Return true if enough rooms available
  RETURN (v_total_rooms - v_booked_rooms) >= p_rooms_needed;
END;
$$;