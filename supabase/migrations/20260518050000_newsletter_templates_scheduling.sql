-- PR #3 of the newsletter audit: templates + scheduled sends.
--
-- Templates: per-org reusable email shells. Admins click "Save as Template" on
-- any draft/sent campaign and it appears in the "Templates" picker when starting
-- a new campaign. Conceptually identical to a campaign minus the recipient
-- state (no sent_at, no recipient_count, no analytics tie-back) — but worth a
-- separate table because (a) campaigns are append-only after send and
-- templates need to remain editable indefinitely, and (b) listing templates
-- shouldn't need to filter past sent campaigns.
--
-- Scheduling: a campaign's lifecycle becomes
--   draft     (sent_at NULL, scheduled_at NULL)
--   scheduled (sent_at NULL, scheduled_at > now())
--   sent      (sent_at NOT NULL)
-- We add a pg_cron worker that wakes every 5 minutes, finds rows whose
-- scheduled_at has passed, and invokes the send-newsletter function for each.

------------------------------------------------------------------------------
-- newsletter_templates
------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.newsletter_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  cover_image_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_templates_org
  ON public.newsletter_templates(organization_id);

ALTER TABLE public.newsletter_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can view templates"
  ON public.newsletter_templates FOR SELECT TO authenticated
  USING (can_manage_organization(auth.uid(), organization_id) OR is_platform_admin(auth.uid()));

CREATE POLICY "Org admins can insert templates"
  ON public.newsletter_templates FOR INSERT TO authenticated
  WITH CHECK (can_manage_organization(auth.uid(), organization_id) OR is_platform_admin(auth.uid()));

CREATE POLICY "Org admins can update templates"
  ON public.newsletter_templates FOR UPDATE TO authenticated
  USING (can_manage_organization(auth.uid(), organization_id) OR is_platform_admin(auth.uid()))
  WITH CHECK (can_manage_organization(auth.uid(), organization_id) OR is_platform_admin(auth.uid()));

CREATE POLICY "Org admins can delete templates"
  ON public.newsletter_templates FOR DELETE TO authenticated
  USING (can_manage_organization(auth.uid(), organization_id) OR is_platform_admin(auth.uid()));

------------------------------------------------------------------------------
-- newsletter_campaigns.scheduled_at
------------------------------------------------------------------------------

ALTER TABLE public.newsletter_campaigns
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz;

-- The cron worker scans for due campaigns on every tick; index the predicate.
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_due
  ON public.newsletter_campaigns(scheduled_at)
  WHERE sent_at IS NULL AND scheduled_at IS NOT NULL;

------------------------------------------------------------------------------
-- Cron: tick every 5 minutes and invoke process-scheduled-newsletters
------------------------------------------------------------------------------

-- Drop existing schedule first so this migration is idempotent.
SELECT cron.unschedule('newsletter-scheduled-sender')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'newsletter-scheduled-sender');

SELECT cron.schedule(
  'newsletter-scheduled-sender',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://joiovubyokikqjytxtuv.supabase.co/functions/v1/process-scheduled-newsletters',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaW92dWJ5b2tpa3FqeXR4dHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDc2OTQsImV4cCI6MjA2NDgyMzY5NH0.cSinlIK2dbTx_oYXJRyxB6kZKbqBJ6iM3jKR2JSfIIM',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
