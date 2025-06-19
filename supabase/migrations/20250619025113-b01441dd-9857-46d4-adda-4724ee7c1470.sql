
-- Create table for email tracking events
CREATE TABLE public.newsletter_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  subscriber_email TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complained')),
  event_data JSONB DEFAULT '{}',
  user_agent TEXT,
  ip_address TEXT,
  location_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for click tracking
CREATE TABLE public.newsletter_click_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  subscriber_email TEXT NOT NULL,
  original_url TEXT NOT NULL,
  tracking_id TEXT NOT NULL UNIQUE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_newsletter_analytics_campaign_id ON public.newsletter_analytics(campaign_id);
CREATE INDEX idx_newsletter_analytics_event_type ON public.newsletter_analytics(event_type);
CREATE INDEX idx_newsletter_analytics_created_at ON public.newsletter_analytics(created_at);
CREATE INDEX idx_click_tracking_campaign_id ON public.newsletter_click_tracking(campaign_id);
CREATE INDEX idx_click_tracking_tracking_id ON public.newsletter_click_tracking(tracking_id);

-- Enable RLS on analytics tables
ALTER TABLE public.newsletter_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_click_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics tables (admin access only)
CREATE POLICY "Admins can view all newsletter analytics" 
  ON public.newsletter_analytics 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "System can insert newsletter analytics" 
  ON public.newsletter_analytics 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can view all click tracking" 
  ON public.newsletter_click_tracking 
  FOR SELECT 
  USING (public.is_admin());

CREATE POLICY "System can manage click tracking" 
  ON public.newsletter_click_tracking 
  FOR ALL 
  USING (true);

-- Add tracking fields to newsletter_campaigns table
ALTER TABLE public.newsletter_campaigns 
ADD COLUMN IF NOT EXISTS open_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS bounce_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_opens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_bounces INTEGER DEFAULT 0;
