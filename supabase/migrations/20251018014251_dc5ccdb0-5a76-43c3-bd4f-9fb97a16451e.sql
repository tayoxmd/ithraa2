-- Create trigger function to send notifications on booking updates
CREATE OR REPLACE FUNCTION public.notify_booking_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only trigger notifications for status changes
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.user_id IS NOT NULL THEN
    -- Call edge function to send email notification
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-booking-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
      ),
      body := jsonb_build_object(
        'bookingId', NEW.id::text,
        'action', 'status_change',
        'oldValue', OLD.status::text,
        'newValue', NEW.status::text
      )
    );
  END IF;
  
  -- Trigger for payment status changes
  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status AND NEW.user_id IS NOT NULL THEN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-booking-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
      ),
      body := jsonb_build_object(
        'bookingId', NEW.id::text,
        'action', 'payment_update',
        'oldValue', OLD.payment_status::text,
        'newValue', NEW.payment_status::text
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on bookings table
DROP TRIGGER IF EXISTS notify_on_booking_update ON public.bookings;
CREATE TRIGGER notify_on_booking_update
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_booking_update();