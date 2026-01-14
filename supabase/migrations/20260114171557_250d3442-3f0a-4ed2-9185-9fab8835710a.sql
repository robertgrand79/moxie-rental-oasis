-- Update the notify_new_support_ticket function to also handle feedback
CREATE OR REPLACE FUNCTION public.notify_new_support_ticket()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Notify for new support tickets
  IF NEW.type = 'support' AND NEW.status = 'open' THEN
    PERFORM public.create_platform_notification(
      'new_ticket',
      'support',
      'New Support Ticket: ' || COALESCE(NEW.ticket_number, 'TKT'),
      COALESCE(NEW.subject, 'Support request') || ' from ' || COALESCE(NEW.email, 'unknown'),
      '/admin/platform/inbox?id=' || NEW.id::text,
      jsonb_build_object('ticket_id', NEW.id, 'ticket_number', NEW.ticket_number, 'subject', NEW.subject),
      CASE WHEN NEW.priority = 'urgent' THEN 'urgent' WHEN NEW.priority = 'high' THEN 'high' ELSE 'normal' END
    );
  -- Notify for new feedback submissions
  ELSIF NEW.type = 'feedback' THEN
    PERFORM public.create_platform_notification(
      'new_feedback',
      'feedback',
      'New Feedback: ' || COALESCE(NEW.category, 'General'),
      COALESCE(NEW.subject, 'Feedback') || ' from ' || COALESCE(NEW.email, 'unknown'),
      '/admin/platform/inbox?type=feedback&id=' || NEW.id::text,
      jsonb_build_object('feedback_id', NEW.id, 'category', NEW.category, 'subject', NEW.subject),
      'normal'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create a trigger function for new platform emails
CREATE OR REPLACE FUNCTION public.notify_new_platform_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only notify for inbound emails that are not spam
  IF NEW.direction = 'inbound' AND COALESCE(NEW.is_spam, false) = false THEN
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

-- Create trigger for new platform emails
DROP TRIGGER IF EXISTS on_new_platform_email ON public.platform_emails;
CREATE TRIGGER on_new_platform_email
  AFTER INSERT ON public.platform_emails
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_platform_email();