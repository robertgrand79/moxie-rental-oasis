-- Create function to invoke send-instant-notification edge function
CREATE OR REPLACE FUNCTION public.trigger_instant_notification()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url TEXT;
  service_key TEXT;
  payload JSONB;
BEGIN
  -- Only trigger for non-archived notifications
  IF NEW.is_archived = true THEN
    RETURN NEW;
  END IF;

  -- Build payload
  payload := jsonb_build_object(
    'notification_id', NEW.id,
    'organization_id', NEW.organization_id,
    'user_id', NEW.user_id,
    'notification_type', NEW.notification_type,
    'category', NEW.category,
    'title', NEW.title,
    'message', NEW.message,
    'action_url', NEW.action_url,
    'priority', NEW.priority
  );

  -- Use pg_net to call the edge function asynchronously
  PERFORM net.http_post(
    url := 'https://joiovubyokikqjytxtuv.supabase.co/functions/v1/send-instant-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the insert
    RAISE WARNING 'Failed to trigger instant notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on admin_notifications insert
DROP TRIGGER IF EXISTS on_notification_created ON public.admin_notifications;
CREATE TRIGGER on_notification_created
  AFTER INSERT ON public.admin_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_instant_notification();

-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;