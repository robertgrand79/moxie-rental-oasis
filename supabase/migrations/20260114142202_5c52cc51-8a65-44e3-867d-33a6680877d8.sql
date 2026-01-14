-- Feature flags table for toggling features per tenant/tier
CREATE TABLE public.platform_feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_key TEXT NOT NULL UNIQUE,
  flag_name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  target_type TEXT NOT NULL DEFAULT 'all' CHECK (target_type IN ('all', 'tier', 'organization', 'percentage')),
  target_tiers TEXT[] DEFAULT NULL,
  target_organization_ids UUID[] DEFAULT NULL,
  target_percentage INTEGER DEFAULT NULL CHECK (target_percentage IS NULL OR (target_percentage >= 0 AND target_percentage <= 100)),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SLA definitions table
CREATE TABLE public.platform_sla_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sla_name TEXT NOT NULL,
  sla_type TEXT NOT NULL CHECK (sla_type IN ('uptime', 'response_time', 'resolution_time', 'support_response')),
  target_value NUMERIC NOT NULL,
  target_unit TEXT NOT NULL CHECK (target_unit IN ('percent', 'minutes', 'hours', 'days')),
  applies_to_tiers TEXT[] NOT NULL DEFAULT ARRAY['starter', 'professional', 'enterprise'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SLA tracking/metrics table
CREATE TABLE public.platform_sla_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  sla_definition_id UUID REFERENCES public.platform_sla_definitions(id) ON DELETE CASCADE,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  actual_value NUMERIC NOT NULL,
  target_value NUMERIC NOT NULL,
  is_breached BOOLEAN NOT NULL DEFAULT false,
  breach_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SLA breaches for alerting
CREATE TABLE public.platform_sla_breaches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  sla_definition_id UUID REFERENCES public.platform_sla_definitions(id) ON DELETE CASCADE,
  breach_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  breach_end TIMESTAMPTZ,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('warning', 'critical', 'resolved')),
  actual_value NUMERIC NOT NULL,
  target_value NUMERIC NOT NULL,
  notified_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance metrics table
CREATE TABLE public.platform_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('api_latency', 'error_rate', 'request_count', 'storage_usage', 'bandwidth', 'active_users')),
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT NOT NULL,
  endpoint TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for performance
CREATE INDEX idx_feature_flags_key ON public.platform_feature_flags(flag_key);
CREATE INDEX idx_sla_metrics_org ON public.platform_sla_metrics(organization_id, period_start);
CREATE INDEX idx_sla_breaches_org ON public.platform_sla_breaches(organization_id, breach_start);
CREATE INDEX idx_sla_breaches_unresolved ON public.platform_sla_breaches(organization_id) WHERE resolved_at IS NULL;
CREATE INDEX idx_performance_metrics_org ON public.platform_performance_metrics(organization_id, recorded_at);
CREATE INDEX idx_performance_metrics_type ON public.platform_performance_metrics(metric_type, recorded_at);

-- Enable RLS
ALTER TABLE public.platform_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_sla_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_sla_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_sla_breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Platform admin policies
CREATE POLICY "Platform admins can manage feature flags"
ON public.platform_feature_flags FOR ALL
USING (public.is_platform_admin());

CREATE POLICY "Platform admins can manage SLA definitions"
ON public.platform_sla_definitions FOR ALL
USING (public.is_platform_admin());

CREATE POLICY "Platform admins can view all SLA metrics"
ON public.platform_sla_metrics FOR ALL
USING (public.is_platform_admin());

CREATE POLICY "Platform admins can manage SLA breaches"
ON public.platform_sla_breaches FOR ALL
USING (public.is_platform_admin());

CREATE POLICY "Platform admins can view all performance metrics"
ON public.platform_performance_metrics FOR ALL
USING (public.is_platform_admin());

-- Insert default SLA definitions
INSERT INTO public.platform_sla_definitions (sla_name, sla_type, target_value, target_unit, applies_to_tiers) VALUES
('Platform Uptime', 'uptime', 99.9, 'percent', ARRAY['starter', 'professional', 'enterprise']),
('API Response Time', 'response_time', 500, 'minutes', ARRAY['starter', 'professional', 'enterprise']),
('Support First Response', 'support_response', 24, 'hours', ARRAY['starter']),
('Support First Response', 'support_response', 4, 'hours', ARRAY['professional']),
('Support First Response', 'support_response', 1, 'hours', ARRAY['enterprise']),
('Issue Resolution', 'resolution_time', 72, 'hours', ARRAY['starter', 'professional']),
('Issue Resolution', 'resolution_time', 24, 'hours', ARRAY['enterprise']);

-- Insert default feature flags
INSERT INTO public.platform_feature_flags (flag_key, flag_name, description, is_enabled, target_type) VALUES
('ai_assistant', 'AI Guest Assistant', 'Enable AI-powered guest chat assistant', true, 'all'),
('dynamic_pricing', 'Dynamic Pricing', 'Enable PriceLabs integration for dynamic pricing', true, 'tier'),
('smart_locks', 'Smart Lock Integration', 'Enable Seam smart lock integrations', true, 'tier'),
('analytics_advanced', 'Advanced Analytics', 'Enable detailed analytics dashboard', false, 'tier'),
('api_access', 'API Access', 'Enable REST API access for integrations', false, 'tier'),
('white_label', 'White Label Mode', 'Enable full white-label customization', false, 'tier');

UPDATE public.platform_feature_flags SET target_tiers = ARRAY['professional', 'enterprise'] WHERE flag_key IN ('dynamic_pricing', 'smart_locks');
UPDATE public.platform_feature_flags SET target_tiers = ARRAY['enterprise'] WHERE flag_key IN ('analytics_advanced', 'api_access', 'white_label');

-- Function to check if a feature is enabled for an organization
CREATE OR REPLACE FUNCTION public.is_feature_enabled(p_flag_key TEXT, p_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_flag RECORD;
  v_org_tier TEXT;
BEGIN
  -- Get the feature flag
  SELECT * INTO v_flag FROM platform_feature_flags WHERE flag_key = p_flag_key;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  IF NOT v_flag.is_enabled THEN
    RETURN false;
  END IF;
  
  -- Check target type
  CASE v_flag.target_type
    WHEN 'all' THEN
      RETURN true;
    WHEN 'organization' THEN
      RETURN p_organization_id = ANY(v_flag.target_organization_ids);
    WHEN 'tier' THEN
      SELECT subscription_tier INTO v_org_tier FROM organizations WHERE id = p_organization_id;
      RETURN v_org_tier = ANY(v_flag.target_tiers);
    WHEN 'percentage' THEN
      -- Use org ID hash for consistent percentage rollout
      RETURN (abs(hashtext(p_organization_id::text)) % 100) < v_flag.target_percentage;
    ELSE
      RETURN false;
  END CASE;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_platform_feature_flags_updated_at
  BEFORE UPDATE ON public.platform_feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_platform_sla_definitions_updated_at
  BEFORE UPDATE ON public.platform_sla_definitions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();