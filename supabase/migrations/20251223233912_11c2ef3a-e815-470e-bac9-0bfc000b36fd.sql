-- Create the database trigger for instant notifications
-- This trigger will call the edge function whenever a new notification is inserted

-- First, ensure the pg_net extension is enabled (needed for HTTP calls from triggers)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create the trigger on admin_notifications table
CREATE TRIGGER on_admin_notification_insert
AFTER INSERT ON public.admin_notifications
FOR EACH ROW
EXECUTE FUNCTION public.trigger_instant_notification();