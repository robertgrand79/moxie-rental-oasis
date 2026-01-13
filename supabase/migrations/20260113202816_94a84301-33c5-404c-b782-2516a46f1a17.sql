-- Onboarding funnel stages enum
CREATE TYPE public.onboarding_stage AS ENUM (
  'signup_started',
  'email_verified',
  'org_created',
  'template_selected',
  'first_property_added',
  'guidebook_created',
  'assistant_configured',
  'first_booking',
  'completed'
);

-- Track onboarding progress for each organization
CREATE TABLE public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  current_stage public.onboarding_stage NOT NULL DEFAULT 'signup_started',
  stage_history JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  is_stuck BOOLEAN DEFAULT false,
  stuck_detected_at TIMESTAMPTZ,
  stuck_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id)
);

-- Enable RLS
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Platform admins only
CREATE POLICY "Platform admins can view all onboarding progress" ON public.onboarding_progress
  FOR SELECT USING (public.is_platform_admin());

CREATE POLICY "Platform admins can update onboarding progress" ON public.onboarding_progress
  FOR UPDATE USING (public.is_platform_admin());

-- Allow system inserts (for triggers/functions)
CREATE POLICY "System can insert onboarding progress" ON public.onboarding_progress
  FOR INSERT WITH CHECK (true);

-- Index for stuck detection queries
CREATE INDEX idx_onboarding_progress_stuck ON public.onboarding_progress(is_stuck, current_stage);
CREATE INDEX idx_onboarding_progress_last_activity ON public.onboarding_progress(last_activity_at);

-- View for tenant health scores (using last_login_at)
CREATE OR REPLACE VIEW public.platform_tenant_health AS
SELECT 
  o.id AS organization_id,
  o.name AS organization_name,
  o.slug,
  o.created_at,
  o.subscription_status,
  o.subscription_tier,
  op.current_stage,
  op.started_at AS onboarding_started_at,
  op.last_activity_at,
  op.completed_at AS onboarding_completed_at,
  op.is_stuck,
  op.stuck_detected_at,
  CASE WHEN p.property_count > 0 THEN 1 ELSE 0 END AS has_properties,
  CASE WHEN gb.guidebook_count > 0 THEN 1 ELSE 0 END AS has_guidebook,
  CASE WHEN ast.is_enabled IS TRUE THEN 1 ELSE 0 END AS has_assistant,
  CASE WHEN res.recent_bookings > 0 THEN 1 ELSE 0 END AS has_recent_bookings,
  COALESCE(conv.conversation_count, 0) AS total_conversations,
  COALESCE(conv.recent_conversations, 0) AS conversations_last_7d,
  COALESCE(res.total_bookings, 0) AS total_bookings,
  COALESCE(res.recent_bookings, 0) AS bookings_last_30d,
  LEAST(100, (
    CASE WHEN p.property_count > 0 THEN 10 ELSE 0 END +
    CASE WHEN gb.guidebook_count > 0 THEN 10 ELSE 0 END +
    CASE WHEN ast.is_enabled IS TRUE THEN 10 ELSE 0 END +
    CASE WHEN op.completed_at IS NOT NULL THEN 10 ELSE 0 END +
    CASE WHEN op.last_activity_at > now() - interval '7 days' THEN 15 ELSE 
         CASE WHEN op.last_activity_at > now() - interval '30 days' THEN 8 ELSE 0 END 
    END +
    CASE WHEN EXISTS (
      SELECT 1 FROM public.profiles pf 
      WHERE pf.organization_id = o.id 
      AND pf.last_login_at > now() - interval '7 days'
    ) THEN 15 ELSE 0 END +
    LEAST(15, COALESCE(conv.recent_conversations, 0) * 3) +
    LEAST(15, COALESCE(res.recent_bookings, 0) * 5)
  )) AS health_score,
  EXTRACT(DAY FROM now() - op.last_activity_at)::integer AS days_inactive
FROM public.organizations o
LEFT JOIN public.onboarding_progress op ON op.organization_id = o.id
LEFT JOIN (
  SELECT organization_id, COUNT(*) AS property_count
  FROM public.properties
  GROUP BY organization_id
) p ON p.organization_id = o.id
LEFT JOIN (
  SELECT organization_id, COUNT(*) AS guidebook_count
  FROM public.property_guidebooks
  GROUP BY organization_id
) gb ON gb.organization_id = o.id
LEFT JOIN public.assistant_settings ast ON ast.organization_id = o.id
LEFT JOIN (
  SELECT organization_id,
    COUNT(*) AS conversation_count,
    COUNT(*) FILTER (WHERE created_at > now() - interval '7 days') AS recent_conversations
  FROM public.assistant_conversations
  GROUP BY organization_id
) conv ON conv.organization_id = o.id
LEFT JOIN (
  SELECT organization_id,
    COUNT(*) AS total_bookings,
    COUNT(*) FILTER (WHERE created_at > now() - interval '30 days') AS recent_bookings
  FROM public.reservations
  GROUP BY organization_id
) res ON res.organization_id = o.id;

-- View for funnel conversion rates
CREATE OR REPLACE VIEW public.platform_onboarding_funnel AS
WITH stage_counts AS (
  SELECT 
    current_stage,
    COUNT(*) AS org_count,
    COUNT(*) FILTER (WHERE is_stuck) AS stuck_count
  FROM public.onboarding_progress
  GROUP BY current_stage
),
total_orgs AS (
  SELECT COUNT(*) AS total FROM public.onboarding_progress
)
SELECT 
  s.current_stage AS stage,
  s.org_count,
  s.stuck_count,
  t.total AS total_signups,
  ROUND((s.org_count::numeric / NULLIF(t.total, 0) * 100), 1) AS percentage,
  ROUND((
    SELECT SUM(sc2.org_count)::numeric 
    FROM stage_counts sc2 
    WHERE sc2.current_stage::text >= s.current_stage::text
  ) / NULLIF(t.total, 0) * 100, 1) AS cumulative_percentage
FROM stage_counts s
CROSS JOIN total_orgs t
ORDER BY 
  CASE s.current_stage
    WHEN 'signup_started' THEN 1
    WHEN 'email_verified' THEN 2
    WHEN 'org_created' THEN 3
    WHEN 'template_selected' THEN 4
    WHEN 'first_property_added' THEN 5
    WHEN 'guidebook_created' THEN 6
    WHEN 'assistant_configured' THEN 7
    WHEN 'first_booking' THEN 8
    WHEN 'completed' THEN 9
  END;

-- Function to detect and flag stuck users
CREATE OR REPLACE FUNCTION public.detect_stuck_onboarding()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.onboarding_progress
  SET 
    is_stuck = true,
    stuck_detected_at = CASE WHEN is_stuck = false THEN now() ELSE stuck_detected_at END,
    updated_at = now()
  WHERE 
    completed_at IS NULL
    AND last_activity_at < now() - interval '3 days'
    AND (is_stuck = false OR stuck_detected_at IS NULL);
    
  INSERT INTO public.platform_tasks (
    organization_id,
    task_type,
    title,
    description,
    priority,
    status
  )
  SELECT 
    op.organization_id,
    'onboarding_followup',
    'Onboarding stalled for ' || o.name,
    'Organization has been stuck at ' || op.current_stage::text || ' stage for ' || 
    EXTRACT(DAY FROM now() - op.last_activity_at)::integer || ' days.',
    'high',
    'pending'
  FROM public.onboarding_progress op
  JOIN public.organizations o ON o.id = op.organization_id
  WHERE 
    op.is_stuck = true 
    AND op.stuck_notified = false
    AND NOT EXISTS (
      SELECT 1 FROM public.platform_tasks pt 
      WHERE pt.organization_id = op.organization_id 
      AND pt.task_type = 'onboarding_followup'
      AND pt.status IN ('pending', 'in_progress')
    );
    
  UPDATE public.onboarding_progress
  SET stuck_notified = true, updated_at = now()
  WHERE is_stuck = true AND stuck_notified = false;
END;
$$;

-- Trigger to initialize onboarding progress when org is created
CREATE OR REPLACE FUNCTION public.initialize_onboarding_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.onboarding_progress (
    organization_id,
    user_id,
    current_stage,
    stage_history
  ) VALUES (
    NEW.id,
    COALESCE(NEW.owner_id, auth.uid()),
    'org_created',
    jsonb_build_array(jsonb_build_object('stage', 'org_created', 'at', now()))
  )
  ON CONFLICT (organization_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_initialize_onboarding ON public.organizations;
CREATE TRIGGER trigger_initialize_onboarding
AFTER INSERT ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.initialize_onboarding_progress();

-- Function to update onboarding stage
CREATE OR REPLACE FUNCTION public.update_onboarding_stage(
  p_organization_id UUID,
  p_new_stage public.onboarding_stage
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.onboarding_progress
  SET 
    current_stage = p_new_stage,
    stage_history = stage_history || jsonb_build_array(
      jsonb_build_object('stage', p_new_stage::text, 'at', now())
    ),
    last_activity_at = now(),
    is_stuck = false,
    completed_at = CASE WHEN p_new_stage = 'completed' THEN now() ELSE completed_at END,
    updated_at = now()
  WHERE organization_id = p_organization_id;
END;
$$;