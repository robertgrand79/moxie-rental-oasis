-- newsletter_suppression: per-org email suppression list populated by Resend
-- webhook events (bounces, complaints) and one-click unsubscribes. The send
-- pipeline filters subscribers against this table before queueing to Resend,
-- so we never re-attempt delivery to an address that previously hard-bounced
-- or marked us as spam (both of which hurt the sender domain's reputation
-- and risk getting the whole org's mail throttled or blocked).
--
-- We use a dedicated table rather than columns on newsletter_subscribers
-- because suppressions need to outlive subscriber-row deletions (admin
-- removes a subscriber, suppression persists so they can't be re-added by
-- public signup form). It also makes the suppression list queryable
-- independently for audit/reporting.

CREATE TABLE IF NOT EXISTS public.newsletter_suppression (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  reason text NOT NULL CHECK (reason IN ('hard_bounce', 'soft_bounce', 'complaint', 'unsubscribed', 'manual')),
  resend_event_id text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, email)
);

-- Send pipeline lookup is always (org, email) — make it cheap.
CREATE INDEX IF NOT EXISTS idx_newsletter_suppression_org_email
  ON public.newsletter_suppression(organization_id, email);

ALTER TABLE public.newsletter_suppression ENABLE ROW LEVEL SECURITY;

-- Org admins (or platform admins) can view their org's suppression list.
CREATE POLICY "Org admins can view newsletter suppressions"
  ON public.newsletter_suppression
  FOR SELECT
  TO authenticated
  USING (
    can_manage_organization(auth.uid(), organization_id)
    OR is_platform_admin(auth.uid())
  );

-- Org admins can manually add suppressions (e.g. bulk-removing a problem domain).
CREATE POLICY "Org admins can insert newsletter suppressions"
  ON public.newsletter_suppression
  FOR INSERT
  TO authenticated
  WITH CHECK (
    can_manage_organization(auth.uid(), organization_id)
    OR is_platform_admin(auth.uid())
  );

-- Org admins can remove a suppression (e.g. user contacted support to be reinstated).
CREATE POLICY "Org admins can delete newsletter suppressions"
  ON public.newsletter_suppression
  FOR DELETE
  TO authenticated
  USING (
    can_manage_organization(auth.uid(), organization_id)
    OR is_platform_admin(auth.uid())
  );

-- No UPDATE policy: suppressions are append-only from the client side. The
-- Resend webhook function uses the service role so RLS doesn't apply to it.
