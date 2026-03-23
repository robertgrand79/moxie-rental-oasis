-- Backfill inbound_email_prefix from slug for all orgs that don't have one
UPDATE public.organizations
SET inbound_email_prefix = slug
WHERE inbound_email_prefix IS NULL AND slug IS NOT NULL;

-- Auto-set inbound_email_prefix on insert if not provided
CREATE OR REPLACE FUNCTION public.auto_set_inbound_email_prefix()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.inbound_email_prefix IS NULL AND NEW.slug IS NOT NULL THEN
    NEW.inbound_email_prefix := NEW.slug;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_set_inbound_email_prefix
  BEFORE INSERT ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_set_inbound_email_prefix();