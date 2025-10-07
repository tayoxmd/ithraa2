-- Create function to safely fetch guest bookings by phone with RLS session var
create or replace function public.get_guest_bookings(p_phone text)
returns table (
  id uuid,
  check_in date,
  check_out date,
  guests integer,
  rooms integer,
  total_amount numeric,
  status booking_status,
  payment_status payment_status,
  amount_paid numeric,
  payment_method text,
  guest_name text,
  guest_phone text,
  hotel_confirmation_number text,
  booking_number integer,
  discount_amount numeric,
  manual_total numeric,
  notes text,
  user_id uuid,
  hotel_name_ar text,
  hotel_name_en text,
  hotel_location text,
  hotel_location_url text,
  hotel_price_per_night numeric,
  hotel_max_guests_per_room integer,
  hotel_tax_percentage numeric,
  hotel_room_type room_type
)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Set session-local variable used by RLS policy
  perform set_config('app.verified_guest_phone', p_phone, true);
  
  return query
  select 
    b.id,
    b.check_in,
    b.check_out,
    b.guests,
    b.rooms,
    b.total_amount,
    b.status,
    b.payment_status,
    b.amount_paid,
    b.payment_method,
    b.guest_name,
    b.guest_phone,
    b.hotel_confirmation_number,
    b.booking_number,
    b.discount_amount,
    b.manual_total,
    b.notes,
    b.user_id,
    h.name_ar as hotel_name_ar,
    h.name_en as hotel_name_en,
    h.location as hotel_location,
    h.location_url as hotel_location_url,
    h.price_per_night as hotel_price_per_night,
    h.max_guests_per_room as hotel_max_guests_per_room,
    h.tax_percentage as hotel_tax_percentage,
    h.room_type as hotel_room_type
  from public.bookings b
  join public.hotels h on h.id = b.hotel_id
  where b.guest_phone = p_phone
  order by b.created_at desc;
end;
$$;