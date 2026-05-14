-- Per-org AI rate limiting
-- Three tables:
--   ai_rate_limit_defaults  : per-surface defaults (rpm, rpd)
--   ai_rate_limit_overrides : per-(org, surface) overrides (NULL falls back to default)
--   ai_request_log          : append-only audit of every check (allowed or blocked)
-- One function:
--   check_and_log_ai_request(org_id, surface) -> (allowed, retry_after_seconds, reason)
--     Atomically: looks up limit -> counts recent allowed rows -> decides -> logs.

CREATE TABLE public.ai_rate_limit_defaults (
  surface     text PRIMARY KEY,
  rpm         integer NOT NULL CHECK (rpm > 0),
  rpd         integer NOT NULL CHECK (rpd > 0),
  description text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.ai_rate_limit_defaults (surface, rpm, rpd, description) VALUES
  ('public_guest_chat',  20, 1000, 'Anon guest-facing AI assistant (public-ai-chat)'),
  ('guest_inbox_reply',  30, 2000, 'Auto-suggested / auto-sent replies on guest messages'),
  ('admin_assistant',    60, 5000, 'Admin AI assistant in the dashboard (ai-chat)'),
  ('admin_content_gen',  30, 2000, 'Admin content generation (descriptions, templates, social)');

CREATE TABLE public.ai_rate_limit_overrides (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  surface         text NOT NULL REFERENCES public.ai_rate_limit_defaults(surface) ON UPDATE CASCADE,
  rpm             integer CHECK (rpm IS NULL OR rpm > 0),
  rpd             integer CHECK (rpd IS NULL OR rpd > 0),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, surface)
);

CREATE TABLE public.ai_request_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  surface         text NOT NULL,
  was_allowed     boolean NOT NULL,
  block_reason    text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_request_log_org_surface_created
  ON public.ai_request_log (organization_id, surface, created_at DESC);

ALTER TABLE public.ai_rate_limit_defaults  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_rate_limit_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_request_log          ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Defaults readable by all authenticated users"
  ON public.ai_rate_limit_defaults FOR SELECT TO authenticated USING (true);
CREATE POLICY "Defaults managed by platform admins"
  ON public.ai_rate_limit_defaults FOR ALL TO authenticated
  USING (is_platform_admin(auth.uid())) WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Overrides readable by org admins or platform admins"
  ON public.ai_rate_limit_overrides FOR SELECT TO authenticated
  USING (can_manage_organization(auth.uid(), organization_id) OR is_platform_admin(auth.uid()));
CREATE POLICY "Overrides managed by platform admins"
  ON public.ai_rate_limit_overrides FOR ALL TO authenticated
  USING (is_platform_admin(auth.uid())) WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Request log readable by org admins or platform admins"
  ON public.ai_request_log FOR SELECT TO authenticated
  USING (can_manage_organization(auth.uid(), organization_id) OR is_platform_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.check_and_log_ai_request(
  p_organization_id uuid,
  p_surface         text
)
RETURNS TABLE(allowed boolean, retry_after_seconds integer, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rpm           integer;
  v_rpd           integer;
  v_minute_count  integer;
  v_day_count     integer;
  v_block_reason  text;
BEGIN
  IF p_organization_id IS NULL THEN
    RAISE EXCEPTION 'organization_id is required';
  END IF;

  SELECT COALESCE(o.rpm, d.rpm), COALESCE(o.rpd, d.rpd)
    INTO v_rpm, v_rpd
  FROM public.ai_rate_limit_defaults d
  LEFT JOIN public.ai_rate_limit_overrides o
    ON o.surface = d.surface AND o.organization_id = p_organization_id
  WHERE d.surface = p_surface;

  IF v_rpm IS NULL OR v_rpd IS NULL THEN
    INSERT INTO public.ai_request_log (organization_id, surface, was_allowed, block_reason)
    VALUES (p_organization_id, p_surface, true, 'unknown_surface');
    RETURN QUERY SELECT true, 0, NULL::text;
    RETURN;
  END IF;

  SELECT count(*) INTO v_minute_count
  FROM public.ai_request_log
  WHERE organization_id = p_organization_id
    AND surface = p_surface
    AND was_allowed = true
    AND created_at > now() - interval '1 minute';

  IF v_minute_count >= v_rpm THEN
    v_block_reason := format('minute_limit:%s/%s', v_minute_count, v_rpm);
    INSERT INTO public.ai_request_log (organization_id, surface, was_allowed, block_reason)
    VALUES (p_organization_id, p_surface, false, v_block_reason);
    RETURN QUERY SELECT false, 60, v_block_reason;
    RETURN;
  END IF;

  SELECT count(*) INTO v_day_count
  FROM public.ai_request_log
  WHERE organization_id = p_organization_id
    AND surface = p_surface
    AND was_allowed = true
    AND created_at > now() - interval '1 day';

  IF v_day_count >= v_rpd THEN
    v_block_reason := format('day_limit:%s/%s', v_day_count, v_rpd);
    INSERT INTO public.ai_request_log (organization_id, surface, was_allowed, block_reason)
    VALUES (p_organization_id, p_surface, false, v_block_reason);
    RETURN QUERY SELECT false, 86400, v_block_reason;
    RETURN;
  END IF;

  INSERT INTO public.ai_request_log (organization_id, surface, was_allowed)
  VALUES (p_organization_id, p_surface, true);
  RETURN QUERY SELECT true, 0, NULL::text;
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_log_ai_request(uuid, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_log_ai_request(uuid, text) TO service_role;

COMMENT ON FUNCTION public.check_and_log_ai_request IS
  'Per-org AI rate limit gate. Edge functions (service_role) call this before invoking the model. Returns allowed=false with retry_after_seconds when an org exceeds its per-minute or per-day cap for the given surface. Always logs the attempt.';
