-- Create admin_notifications table for in-app notifications
CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL = all org users
  notification_type TEXT NOT NULL, -- 'new_booking', 'guest_message', 'work_order', 'check_in', 'payment', etc.
  category TEXT NOT NULL, -- 'bookings', 'communications', 'operations', 'payments', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT, -- Link to relevant page
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional context (booking_id, property_name, etc.)
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create notification_preferences table
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL,
  in_app BOOLEAN DEFAULT true,
  email_instant BOOLEAN DEFAULT false,
  email_digest BOOLEAN DEFAULT true, -- Include in daily recap
  sms BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, organization_id, notification_type)
);

-- Create indexes for performance
CREATE INDEX idx_admin_notifications_org_user ON public.admin_notifications(organization_id, user_id);
CREATE INDEX idx_admin_notifications_unread ON public.admin_notifications(organization_id, user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_admin_notifications_created ON public.admin_notifications(created_at DESC);
CREATE INDEX idx_notification_preferences_user_org ON public.notification_preferences(user_id, organization_id);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin_notifications
CREATE POLICY "Users can view their own notifications"
ON public.admin_notifications FOR SELECT
USING (
  user_belongs_to_organization(auth.uid(), organization_id)
  AND (user_id IS NULL OR user_id = auth.uid())
);

CREATE POLICY "Users can update their own notifications"
ON public.admin_notifications FOR UPDATE
USING (
  user_belongs_to_organization(auth.uid(), organization_id)
  AND (user_id IS NULL OR user_id = auth.uid())
);

CREATE POLICY "System can insert notifications"
ON public.admin_notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
ON public.admin_notifications FOR DELETE
USING (
  user_belongs_to_organization(auth.uid(), organization_id)
  AND (user_id IS NULL OR user_id = auth.uid())
);

-- RLS policies for notification_preferences
CREATE POLICY "Users can manage their own preferences"
ON public.notification_preferences FOR ALL
USING (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- Trigger for updating notification_preferences.updated_at
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();