-- Add escalation tracking columns to admin_notifications
ALTER TABLE public.admin_notifications 
ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS escalation_sent BOOLEAN DEFAULT false;

-- Create index for escalation queries
CREATE INDEX IF NOT EXISTS idx_admin_notifications_escalation 
ON public.admin_notifications (priority, is_read, escalated_at) 
WHERE is_read = false AND priority IN ('urgent', 'high');

-- Create push notification tokens table
CREATE TABLE IF NOT EXISTS public.push_notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(token)
);

-- Enable RLS
ALTER TABLE public.push_notification_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for push tokens
CREATE POLICY "Users can view their own push tokens"
ON public.push_notification_tokens
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push tokens"
ON public.push_notification_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push tokens"
ON public.push_notification_tokens
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own push tokens"
ON public.push_notification_tokens
FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at trigger for push tokens
CREATE TRIGGER update_push_notification_tokens_updated_at
BEFORE UPDATE ON public.push_notification_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for admin_notifications escalation updates
ALTER TABLE public.admin_notifications REPLICA IDENTITY FULL;