-- Fix: Change NEW.submitter_email to NEW.email in the trigger function
CREATE OR REPLACE FUNCTION public.notify_new_support_ticket()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify for new support tickets
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
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;