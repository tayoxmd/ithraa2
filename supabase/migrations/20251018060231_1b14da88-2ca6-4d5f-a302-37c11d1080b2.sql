-- Create function to get available rooms count
CREATE OR REPLACE FUNCTION get_available_rooms_count(
  p_hotel_id UUID,
  p_check_in DATE,
  p_check_out DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_rooms INTEGER;
  v_booked_rooms INTEGER;
BEGIN
  -- Get total rooms for the hotel
  SELECT total_rooms INTO v_total_rooms
  FROM hotels
  WHERE id = p_hotel_id;
  
  IF v_total_rooms IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate booked rooms for overlapping dates
  SELECT COALESCE(SUM(rooms_booked), 0) INTO v_booked_rooms
  FROM room_availability
  WHERE hotel_id = p_hotel_id
    AND check_in < p_check_out
    AND check_out > p_check_in;
  
  -- Return available rooms
  RETURN GREATEST(0, v_total_rooms - v_booked_rooms);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_available_rooms_count(UUID, DATE, DATE) TO anon, authenticated;