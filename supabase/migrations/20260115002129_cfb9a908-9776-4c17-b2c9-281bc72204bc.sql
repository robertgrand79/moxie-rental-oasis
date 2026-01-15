-- Update the trigger function to filter out internal emails from @moxievacationrentals.com
CREATE OR REPLACE FUNCTION public.notify_new_platform_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only notify for inbound emails that are not spam and not from internal domain
  IF NEW.direction = 'inbound' 
     AND COALESCE(NEW.is_spam, false) = false 
     AND COALESCE(NEW.from_address, '') NOT ILIKE '%@moxievacationrentals.com' THEN
    PERFORM public.create_platform_notification(
      'new_email',
      'email',
      'New Email: ' || COALESCE(NEW.subject, 'No Subject'),
      'From ' || COALESCE(NEW.from_name, NEW.from_address),
      '/admin/platform/email?id=' || NEW.id::text,
      jsonb_build_object('email_id', NEW.id, 'from', NEW.from_address, 'subject', NEW.subject),
      'normal'
    );
  END IF;
  RETURN NEW;
END;
$$;