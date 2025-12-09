-- Fix 1: Rate limits table - restrict to service_role only
DROP POLICY IF EXISTS "System can manage rate limits" ON public.rate_limits;

CREATE POLICY "Only service role can manage rate limits" 
ON public.rate_limits
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');