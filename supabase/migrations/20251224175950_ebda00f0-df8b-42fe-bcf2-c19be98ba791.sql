-- Add RLS policies for tables that have RLS enabled but no policies

-- 1. stripe_webhook_events - service role only (these are Stripe webhook events)
CREATE POLICY "Service role only for stripe_webhook_events"
ON public.stripe_webhook_events
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- 2. account_lockouts - service role only (security sensitive lockout data)
CREATE POLICY "Service role only for account_lockouts"
ON public.account_lockouts
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);