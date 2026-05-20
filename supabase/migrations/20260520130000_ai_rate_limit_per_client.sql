-- Per-client (per-IP) rate limiting for AI surfaces.
--
-- The existing limiter is per-organization only, so a single abusive client
-- can exhaust an org's whole quota and deny service to real guests. This adds
-- an optional per-client cap, checked before the per-org cap.

ALTER TABLE public.ai_rate_limit_defaults
  ADD COLUMN IF NOT EXISTS client_rpm integer CHECK (client_rpm IS NULL OR client_rpm > 0),
  ADD COLUMN IF NOT EXISTS client_rpd integer CHECK (client_rpd IS NULL OR client_rpd > 0);

-- Per-client caps for the anonymous public guest chat. Other surfaces are
-- authenticated and keep org-only limits (client columns left NULL).
UPDATE public.ai_rate_limit_defaults
  SET client_rpm = 10, client_rpd = 100
  WHERE surface = 'public_guest_chat';

ALTER TABLE public.ai_request_log
  ADD COLUMN IF NOT EXISTS client_key text;

CREATE INDEX IF NOT EXISTS idx_ai_request_log_surface_client_created
  ON public.ai_request_log (surface, client_key, created_at DESC)
  WHERE client_key IS NOT NULL;

-- Replace the 2-arg gate with a 3-arg version. A defaulted p_client_key keeps
-- existing 2-arg callers working unchanged until they pass a client key.
DROP FUNCTION IF EXISTS public.check_and_log_ai_request(uuid, text);

CREATE OR REPLACE FUNCTION public.check_and_log_ai_request(
  p_organization_id uuid,
  p_surface         text,
  p_client_key      text DEFAULT NULL
)
RETURNS TABLE(allowed boolean, retry_after_seconds integer, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rpm           integer;
  v_rpd           integer;
  v_client_rpm    integer;
  v_client_rpd    integer;
  v_minute_count  integer;
  v_day_count     integer;
  v_client_count  integer;
  v_block_reason  text;
BEGIN
  IF p_organization_id IS NULL THEN
    RAISE EXCEPTION 'organization_id is required';
  END IF;

  SELECT COALESCE(o.rpm, d.rpm), COALESCE(o.rpd, d.rpd), d.client_rpm, d.client_rpd
    INTO v_rpm, v_rpd, v_client_rpm, v_client_rpd
  FROM public.ai_rate_limit_defaults d
  LEFT JOIN public.ai_rate_limit_overrides o
    ON o.surface = d.surface AND o.organization_id = p_organization_id
  WHERE d.surface = p_surface;

  IF v_rpm IS NULL OR v_rpd IS NULL THEN
    INSERT INTO public.ai_request_log (organization_id, surface, was_allowed, block_reason, client_key)
    VALUES (p_organization_id, p_surface, true, 'unknown_surface', p_client_key);
    RETURN QUERY SELECT true, 0, NULL::text;
    RETURN;
  END IF;

  -- Per-client minute limit (only when a client key is supplied and the
  -- surface defines client caps).
  IF p_client_key IS NOT NULL AND v_client_rpm IS NOT NULL THEN
    SELECT count(*) INTO v_client_count
    FROM public.ai_request_log
    WHERE surface = p_surface
      AND client_key = p_client_key
      AND was_allowed = true
      AND created_at > now() - interval '1 minute';

    IF v_client_count >= v_client_rpm THEN
      v_block_reason := format('client_minute_limit:%s/%s', v_client_count, v_client_rpm);
      INSERT INTO public.ai_request_log (organization_id, surface, was_allowed, block_reason, client_key)
      VALUES (p_organization_id, p_surface, false, v_block_reason, p_client_key);
      RETURN QUERY SELECT false, 60, v_block_reason;
      RETURN;
    END IF;
  END IF;

  -- Per-client day limit
  IF p_client_key IS NOT NULL AND v_client_rpd IS NOT NULL THEN
    SELECT count(*) INTO v_client_count
    FROM public.ai_request_log
    WHERE surface = p_surface
      AND client_key = p_client_key
      AND was_allowed = true
      AND created_at > now() - interval '1 day';

    IF v_client_count >= v_client_rpd THEN
      v_block_reason := format('client_day_limit:%s/%s', v_client_count, v_client_rpd);
      INSERT INTO public.ai_request_log (organization_id, surface, was_allowed, block_reason, client_key)
      VALUES (p_organization_id, p_surface, false, v_block_reason, p_client_key);
      RETURN QUERY SELECT false, 86400, v_block_reason;
      RETURN;
    END IF;
  END IF;

  -- Per-org minute limit
  SELECT count(*) INTO v_minute_count
  FROM public.ai_request_log
  WHERE organization_id = p_organization_id
    AND surface = p_surface
    AND was_allowed = true
    AND created_at > now() - interval '1 minute';

  IF v_minute_count >= v_rpm THEN
    v_block_reason := format('minute_limit:%s/%s', v_minute_count, v_rpm);
    INSERT INTO public.ai_request_log (organization_id, surface, was_allowed, block_reason, client_key)
    VALUES (p_organization_id, p_surface, false, v_block_reason, p_client_key);
    RETURN QUERY SELECT false, 60, v_block_reason;
    RETURN;
  END IF;

  -- Per-org day limit
  SELECT count(*) INTO v_day_count
  FROM public.ai_request_log
  WHERE organization_id = p_organization_id
    AND surface = p_surface
    AND was_allowed = true
    AND created_at > now() - interval '1 day';

  IF v_day_count >= v_rpd THEN
    v_block_reason := format('day_limit:%s/%s', v_day_count, v_rpd);
    INSERT INTO public.ai_request_log (organization_id, surface, was_allowed, block_reason, client_key)
    VALUES (p_organization_id, p_surface, false, v_block_reason, p_client_key);
    RETURN QUERY SELECT false, 86400, v_block_reason;
    RETURN;
  END IF;

  INSERT INTO public.ai_request_log (organization_id, surface, was_allowed, client_key)
  VALUES (p_organization_id, p_surface, true, p_client_key);
  RETURN QUERY SELECT true, 0, NULL::text;
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_log_ai_request(uuid, text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_log_ai_request(uuid, text, text) TO service_role;

COMMENT ON FUNCTION public.check_and_log_ai_request IS
  'Per-org + per-client AI rate limit gate. Edge functions (service_role) call this before invoking the model. When p_client_key is supplied and the surface defines client_rpm/client_rpd, enforces per-client (e.g. per-IP) minute/day caps first, then per-org caps. Always logs the attempt.';
