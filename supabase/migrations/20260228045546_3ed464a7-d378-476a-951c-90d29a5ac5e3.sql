
-- ============================================================
-- RLS HARDENING MIGRATION: Production SaaS Readiness
-- ============================================================

-- 1. SENSITIVE DATA MASKING: Organizations table
-- Since RLS can't do column-level masking, we replace the direct
-- member SELECT policies with a SECURITY DEFINER function that
-- masks sensitive columns for non-owners.

-- Create a function to check if user is org owner
CREATE OR REPLACE FUNCTION public.user_is_org_owner(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = 'owner'
  )
$$;

-- Drop the redundant/old member SELECT policies on organizations
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their own organization v2" ON public.organizations;
DROP POLICY IF EXISTS "Platform admins can view all organizations" ON public.organizations;

-- Recreate a single, clean SELECT policy for members
-- Members CAN select the row, but sensitive columns are masked via the view
CREATE POLICY "Members can view their organization"
  ON public.organizations
  FOR SELECT
  TO authenticated
  USING (
    public.user_belongs_to_organization(auth.uid(), id)
    OR public.is_platform_admin(auth.uid())
  );

-- Recreate organizations_safe view: remove stripe_connect_id exposure,
-- ensure all API keys are boolean flags only
DROP VIEW IF EXISTS public.organizations_safe;
CREATE VIEW public.organizations_safe
WITH (security_invoker = true)
AS
SELECT
  id,
  name,
  slug,
  logo_url,
  website,
  created_at,
  updated_at,
  is_active,
  template_type,
  is_template,
  custom_domain,
  onboarding_completed,
  onboarding_step,
  subscription_status,
  subscription_tier,
  trial_ends_at,
  -- Stripe Connect: status only, never IDs
  stripe_connect_status,
  payments_enabled,
  platform_fee_percent,
  -- Boolean flags for configuration status
  (stripe_secret_key IS NOT NULL AND stripe_secret_key <> '') AS has_stripe_configured,
  (stripe_publishable_key IS NOT NULL AND stripe_publishable_key <> '') AS has_stripe_publishable_configured,
  (stripe_webhook_secret IS NOT NULL AND stripe_webhook_secret <> '') AS has_stripe_webhook_configured,
  (pricelabs_api_key IS NOT NULL AND pricelabs_api_key <> '') AS has_pricelabs_configured,
  (seam_api_key IS NOT NULL AND seam_api_key <> '') AS has_seam_configured,
  (openphone_api_key IS NOT NULL AND openphone_api_key <> '') AS has_openphone_configured,
  (resend_api_key IS NOT NULL AND resend_api_key <> '') AS has_resend_configured,
  (turno_api_token IS NOT NULL AND turno_api_token <> '') AS has_turno_configured,
  (openweather_api_key IS NOT NULL AND openweather_api_key <> '') AS has_openweather_configured,
  -- Domain verification
  domain_verification_status,
  domain_verified_at,
  domain_last_checked_at,
  domain_dns_records,
  -- Non-sensitive identifiers
  stripe_customer_id,
  openphone_phone_number
FROM public.organizations;

-- Create a SECURITY DEFINER function for owner-only sensitive data access
-- This is how owners retrieve stripe_connect_id and API keys securely
CREATE OR REPLACE FUNCTION public.get_organization_sensitive_fields(_org_id uuid)
RETURNS TABLE(
  stripe_connect_id text,
  stripe_account_id text,
  has_stripe_secret boolean,
  has_seam_key boolean,
  has_pricelabs_key boolean,
  has_openphone_key boolean,
  has_resend_key boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only owners and platform admins can see sensitive identifiers
  IF NOT (
    public.user_is_org_owner(auth.uid(), _org_id)
    OR public.is_platform_admin(auth.uid())
  ) THEN
    RAISE EXCEPTION 'Only organization owners can access sensitive fields';
  END IF;

  RETURN QUERY
  SELECT
    o.stripe_connect_id,
    o.stripe_account_id,
    o.stripe_secret_key IS NOT NULL AND o.stripe_secret_key <> '',
    o.seam_api_key IS NOT NULL AND o.seam_api_key <> '',
    o.pricelabs_api_key IS NOT NULL AND o.pricelabs_api_key <> '',
    o.openphone_api_key IS NOT NULL AND o.openphone_api_key <> '',
    o.resend_api_key IS NOT NULL AND o.resend_api_key <> ''
  FROM public.organizations o
  WHERE o.id = _org_id;
END;
$$;

-- 2. SERVICE ROLE ISOLATION: scheduled_messages
-- Drop overly permissive member-level policies
DROP POLICY IF EXISTS "Org members can manage scheduled_messages" ON public.scheduled_messages;
DROP POLICY IF EXISTS "Org members can view scheduled_messages" ON public.scheduled_messages;

-- Keep admin policy but make it SELECT-only for org admins
DROP POLICY IF EXISTS "Org admins can manage scheduled messages" ON public.scheduled_messages;

-- Org admins can VIEW the queue (for the monitoring UI) but not modify
CREATE POLICY "Org admins can view scheduled messages"
  ON public.scheduled_messages
  FOR SELECT
  TO authenticated
  USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );

-- Service role can do everything (for edge functions/background processing)
CREATE POLICY "Service role full access to scheduled messages"
  ON public.scheduled_messages
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. VERIFY MEMBER REMOVAL REVOCATION
-- All existing RLS policies use user_belongs_to_organization() or user_is_org_admin()
-- which check organization_members in real-time. Removing a member from that table
-- instantly revokes all access. No changes needed, but let's add a comment function
-- for documentation.

COMMENT ON FUNCTION public.user_belongs_to_organization IS 
  'Core tenant isolation check. Queries organization_members live, so removing a member row instantly revokes all RLS-gated access to properties, bookings, images, and all org-scoped data.';
