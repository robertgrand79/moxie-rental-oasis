-- Fix security definer views by setting security_invoker = true
-- This ensures RLS policies of the querying user are enforced, not the view creator

ALTER VIEW public.organizations_safe SET (security_invoker = true);
ALTER VIEW public.platform_subscription_metrics SET (security_invoker = true);