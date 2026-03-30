ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS is_comped boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS comped_tier text,
  ADD COLUMN IF NOT EXISTS comped_until timestamptz,
  ADD COLUMN IF NOT EXISTS comped_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS comped_at timestamptz,
  ADD COLUMN IF NOT EXISTS comp_notes text;