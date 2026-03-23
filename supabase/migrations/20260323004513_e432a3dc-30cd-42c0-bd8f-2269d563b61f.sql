ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS inbound_email_prefix text UNIQUE;