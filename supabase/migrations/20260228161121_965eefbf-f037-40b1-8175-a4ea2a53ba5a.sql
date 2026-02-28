-- Fix SECURITY DEFINER views by enabling security_invoker
-- This ensures views respect the querying user's RLS policies

ALTER VIEW public.platform_subscription_metrics SET (security_invoker = true);
ALTER VIEW public.platform_tenant_health SET (security_invoker = true);
ALTER VIEW public.platform_onboarding_funnel SET (security_invoker = true);