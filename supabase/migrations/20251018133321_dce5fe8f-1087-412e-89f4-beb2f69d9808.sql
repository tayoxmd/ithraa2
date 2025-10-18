-- Fix failing updates due to missing net schema in notify_booking_update function
-- Wrap http_post calls with a guard and exception handling so booking updates don't fail
CREATE OR REPLACE FUNCTION public.notify_booking_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only attempt HTTP notifications if the optional 'net' schema exists
  IF to_regnamespace('net') IS NOT NULL THEN
    BEGIN
      -- Status change notification
      IF OLD.status IS DISTINCT FROM NEW.status AND NEW.user_id IS NOT NULL THEN
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

      -- Payment status change notification
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
    EXCEPTION WHEN OTHERS THEN
      -- Never block the main transaction due to notification failures
      RAISE NOTICE 'notify_booking_update: http notification failed: %', SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$;