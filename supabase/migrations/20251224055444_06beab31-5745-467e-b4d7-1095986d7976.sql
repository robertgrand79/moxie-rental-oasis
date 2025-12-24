-- Create error_logs table for centralized error tracking
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_id TEXT NOT NULL,
  message TEXT NOT NULL,
  stack TEXT,
  type TEXT NOT NULL DEFAULT 'error',
  severity TEXT NOT NULL DEFAULT 'medium',
  context JSONB DEFAULT '{}',
  fingerprint TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  breadcrumbs JSONB DEFAULT '[]',
  user_agent TEXT,
  url TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics_events table for product analytics
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  user_id UUID,
  organization_id UUID REFERENCES public.organizations(id),
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create application_logs table for structured logging
CREATE TABLE IF NOT EXISTS public.application_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health_check_logs table for health monitoring
CREATE TABLE IF NOT EXISTS public.health_check_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL,
  checks JSONB DEFAULT '[]',
  uptime BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversion_funnels table for funnel tracking
CREATE TABLE IF NOT EXISTS public.conversion_funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_name TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  user_id UUID,
  organization_id UUID REFERENCES public.organizations(id),
  session_id TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  dropped_at TIMESTAMP WITH TIME ZONE,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create platform_metrics table for admin dashboard metrics
CREATE TABLE IF NOT EXISTS public.platform_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_type TEXT NOT NULL DEFAULT 'gauge',
  dimensions JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_error_logs_fingerprint ON public.error_logs(fingerprint);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON public.error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_org ON public.analytics_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_application_logs_level ON public.application_logs(level);
CREATE INDEX IF NOT EXISTS idx_application_logs_created_at ON public.application_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversion_funnels_name ON public.conversion_funnels(funnel_name);
CREATE INDEX IF NOT EXISTS idx_conversion_funnels_user ON public.conversion_funnels(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_funnels_created_at ON public.conversion_funnels(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_metrics_name ON public.platform_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_recorded_at ON public.platform_metrics(recorded_at DESC);

-- Enable RLS on all tables
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_check_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_metrics ENABLE ROW LEVEL SECURITY;

-- Error logs: Allow insert from anyone (for error tracking)
CREATE POLICY "Anyone can insert error logs" ON public.error_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Platform admins can view error logs" ON public.error_logs FOR SELECT USING (public.is_platform_admin(auth.uid()));

-- Analytics events: Allow insert from anyone, view for org members
CREATE POLICY "Anyone can insert analytics events" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Org members can view their analytics" ON public.analytics_events FOR SELECT 
  USING (organization_id IS NULL OR public.user_belongs_to_organization(auth.uid(), organization_id));

-- Application logs: Insert from anyone, view for platform admins
CREATE POLICY "Anyone can insert application logs" ON public.application_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Platform admins can view logs" ON public.application_logs FOR SELECT USING (public.is_platform_admin(auth.uid()));

-- Health check logs: Insert from anyone, view for platform admins
CREATE POLICY "Anyone can insert health check logs" ON public.health_check_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Platform admins can view health logs" ON public.health_check_logs FOR SELECT USING (public.is_platform_admin(auth.uid()));

-- Conversion funnels: Insert from anyone, view for org members
CREATE POLICY "Anyone can insert funnel data" ON public.conversion_funnels FOR INSERT WITH CHECK (true);
CREATE POLICY "Org members can view their funnels" ON public.conversion_funnels FOR SELECT 
  USING (organization_id IS NULL OR public.user_belongs_to_organization(auth.uid(), organization_id));

-- Platform metrics: Insert from anyone, view for platform admins
CREATE POLICY "Anyone can insert metrics" ON public.platform_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Platform admins can view metrics" ON public.platform_metrics FOR SELECT USING (public.is_platform_admin(auth.uid()));

-- Add trigger to clean up old logs (keep 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.error_logs WHERE created_at < now() - interval '30 days';
  DELETE FROM public.application_logs WHERE created_at < now() - interval '30 days';
  DELETE FROM public.health_check_logs WHERE created_at < now() - interval '7 days';
END;
$$;