-- Create platform_notifications table for platform-level events
CREATE TABLE public.platform_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_type TEXT NOT NULL, -- 'new_user', 'new_organization', 'new_ticket', 'system_alert'
  category TEXT NOT NULL, -- 'users', 'organizations', 'support', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create platform_tasks table for platform admin tasks
CREATE TABLE public.platform_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo', -- 'todo', 'in_progress', 'done'
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high'
  due_date DATE,
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_platform_notifications_type ON public.platform_notifications(notification_type);
CREATE INDEX idx_platform_notifications_created_at ON public.platform_notifications(created_at DESC);
CREATE INDEX idx_platform_notifications_is_read ON public.platform_notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_platform_tasks_status ON public.platform_tasks(status);
CREATE INDEX idx_platform_tasks_assigned_to ON public.platform_tasks(assigned_to);

-- Enable RLS
ALTER TABLE public.platform_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for platform_notifications - only platform admins
CREATE POLICY "Platform admins can view all notifications"
  ON public.platform_notifications FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can update notifications"
  ON public.platform_notifications FOR UPDATE
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "System can insert notifications"
  ON public.platform_notifications FOR INSERT
  WITH CHECK (true);

-- RLS policies for platform_tasks - only platform admins
CREATE POLICY "Platform admins can view all tasks"
  ON public.platform_tasks FOR SELECT
  USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can manage tasks"
  ON public.platform_tasks FOR ALL
  USING (public.is_platform_admin(auth.uid()));

-- Function to create platform notification
CREATE OR REPLACE FUNCTION public.create_platform_notification(
  p_type TEXT,
  p_category TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_priority TEXT DEFAULT 'normal'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.platform_notifications (
    notification_type, category, title, message, action_url, metadata, priority
  ) VALUES (
    p_type, p_category, p_title, p_message, p_action_url, p_metadata, p_priority
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Trigger function for new user registration
CREATE OR REPLACE FUNCTION public.notify_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.create_platform_notification(
    'new_user',
    'users',
    'New User Registered',
    COALESCE(NEW.full_name, 'A user') || ' (' || COALESCE(NEW.email, 'no email') || ') has joined the platform',
    '/admin/platform/users?id=' || NEW.id::text,
    jsonb_build_object('user_id', NEW.id, 'email', NEW.email, 'full_name', NEW.full_name),
    'normal'
  );
  RETURN NEW;
END;
$$;

-- Trigger function for new organization
CREATE OR REPLACE FUNCTION public.notify_new_organization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Skip template organizations
  IF NEW.is_template = true THEN
    RETURN NEW;
  END IF;
  
  PERFORM public.create_platform_notification(
    'new_organization',
    'organizations',
    'New Organization Created',
    NEW.name || ' (' || NEW.slug || ') has been created',
    '/admin/platform/organizations?id=' || NEW.id::text,
    jsonb_build_object('organization_id', NEW.id, 'name', NEW.name, 'slug', NEW.slug),
    'normal'
  );
  RETURN NEW;
END;
$$;

-- Trigger function for new support ticket
CREATE OR REPLACE FUNCTION public.notify_new_support_ticket()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only notify for new support tickets
  IF NEW.type = 'support' AND NEW.status = 'open' THEN
    PERFORM public.create_platform_notification(
      'new_ticket',
      'support',
      'New Support Ticket: ' || COALESCE(NEW.ticket_number, 'TKT'),
      COALESCE(NEW.subject, 'Support request') || ' from ' || COALESCE(NEW.submitter_email, 'unknown'),
      '/admin/platform/inbox?id=' || NEW.id::text,
      jsonb_build_object('ticket_id', NEW.id, 'ticket_number', NEW.ticket_number, 'subject', NEW.subject),
      CASE WHEN NEW.priority = 'urgent' THEN 'urgent' WHEN NEW.priority = 'high' THEN 'high' ELSE 'normal' END
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_new_user_registration
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_user_registration();

CREATE TRIGGER on_new_organization
  AFTER INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_organization();

CREATE TRIGGER on_new_support_ticket
  AFTER INSERT ON public.platform_inbox
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_support_ticket();

-- Add updated_at trigger for platform_tasks
CREATE TRIGGER update_platform_tasks_updated_at
  BEFORE UPDATE ON public.platform_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();