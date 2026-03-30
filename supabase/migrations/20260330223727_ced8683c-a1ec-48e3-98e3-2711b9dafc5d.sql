ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS discount_percent integer,
  ADD COLUMN IF NOT EXISTS discount_notes text,
  ADD COLUMN IF NOT EXISTS discount_set_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS discount_set_at timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_coupon_id text;

ALTER TABLE public.organizations
  ADD CONSTRAINT discount_percent_range CHECK (discount_percent IS NULL OR (discount_percent >= 1 AND discount_percent <= 100));