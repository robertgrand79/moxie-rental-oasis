
-- Create a trigger function that calls schedule-reservation-messages via pg_net
-- when a new reservation is inserted into property_reservations
CREATE OR REPLACE FUNCTION public.trigger_schedule_reservation_messages()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only trigger for new reservations (INSERT)
  -- Use pg_net to call the edge function asynchronously
  PERFORM net.http_post(
    url := 'https://joiovubyokikqjytxtuv.supabase.co/functions/v1/schedule-reservation-messages',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object('reservation_id', NEW.id)
  );

  RETURN NEW;
END;
$$;

-- Create the trigger on property_reservations
DROP TRIGGER IF EXISTS on_reservation_created_schedule_messages ON public.property_reservations;
CREATE TRIGGER on_reservation_created_schedule_messages
  AFTER INSERT ON public.property_reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_schedule_reservation_messages();
