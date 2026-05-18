-- Persist the audience for scheduled campaigns. send-newsletter's listId is a
-- per-request flag, but the cron worker fires later from the campaign row, so
-- the row needs to remember which list (if any) the admin picked at schedule
-- time. NULL means "all active subscribers" — same as if listId were omitted.

ALTER TABLE public.newsletter_campaigns
  ADD COLUMN IF NOT EXISTS target_list_id uuid REFERENCES public.newsletter_lists(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_target_list
  ON public.newsletter_campaigns(target_list_id)
  WHERE target_list_id IS NOT NULL;
