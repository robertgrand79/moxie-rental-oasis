ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS stripe_connect_id text,
  ADD COLUMN IF NOT EXISTS stripe_connect_status text DEFAULT 'not_connected',
  ADD COLUMN IF NOT EXISTS payments_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS platform_fee_percent numeric DEFAULT 10.0;