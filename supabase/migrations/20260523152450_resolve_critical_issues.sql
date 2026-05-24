-- 1. Secure get_property_stripe_credentials function
REVOKE EXECUTE ON FUNCTION public.get_property_stripe_credentials(UUID) FROM PUBLIC, authenticated, anon;

CREATE OR REPLACE FUNCTION public.get_property_stripe_credentials(p_property_id UUID)
RETURNS TABLE (
  stripe_secret_key TEXT,
  stripe_publishable_key TEXT,
  stripe_webhook_secret TEXT,
  stripe_account_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Restrict to service_role, postgres, supabase_admin, or authenticated users who can manage this property
  IF auth.role() <> 'service_role' AND auth.role() <> 'supabase_admin' AND NOT (
    auth.role() = 'authenticated' AND (
      is_platform_admin(auth.uid()) OR 
      EXISTS (
        SELECT 1 FROM public.properties p
        WHERE p.id = p_property_id
        AND can_manage_property(auth.uid(), p.id)
      )
    )
  ) THEN
    RAISE EXCEPTION 'Access denied. Insufficient privileges to view Stripe credentials.';
  END IF;

  RETURN QUERY
  SELECT 
    psc.stripe_secret_key,
    psc.stripe_publishable_key,
    psc.stripe_webhook_secret,
    psc.stripe_account_id
  FROM public.property_stripe_credentials psc
  WHERE psc.property_id = p_property_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_property_stripe_credentials(UUID) TO service_role, postgres, supabase_admin;


-- 2. Correct roadmap privilege escalation RLS policies
DROP POLICY IF EXISTS "Platform admins can view roadmap items" ON public.platform_roadmap_items;
DROP POLICY IF EXISTS "Platform admins can create roadmap items" ON public.platform_roadmap_items;
DROP POLICY IF EXISTS "Platform admins can update roadmap items" ON public.platform_roadmap_items;
DROP POLICY IF EXISTS "Platform admins can delete roadmap items" ON public.platform_roadmap_items;

CREATE POLICY "Platform admins can view roadmap items"
ON public.platform_roadmap_items FOR SELECT
USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can create roadmap items"
ON public.platform_roadmap_items FOR INSERT
WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can update roadmap items"
ON public.platform_roadmap_items FOR UPDATE
USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can delete roadmap items"
ON public.platform_roadmap_items FOR DELETE
USING (public.is_platform_admin(auth.uid()));


-- 3. Protect platform subscription metrics view using security_barrier
DROP VIEW IF EXISTS public.platform_subscription_metrics;

CREATE OR REPLACE VIEW public.platform_subscription_metrics WITH (security_barrier) AS
SELECT 
  active_subscriptions,
  trial_subscriptions,
  canceled_subscriptions,
  past_due_subscriptions,
  comped_subscriptions,
  trials_ending_soon,
  monthly_recurring_revenue_cents
FROM (
  SELECT 
    COUNT(*) FILTER (WHERE subscription_status = 'active' AND is_template = false) as active_subscriptions,
    COUNT(*) FILTER (WHERE subscription_status = 'trialing' AND is_template = false) as trial_subscriptions,
    COUNT(*) FILTER (WHERE subscription_status = 'canceled' AND is_template = false) as canceled_subscriptions,
    COUNT(*) FILTER (WHERE subscription_status = 'past_due' AND is_template = false) as past_due_subscriptions,
    COUNT(*) FILTER (WHERE subscription_status = 'comped' AND is_template = false) as comped_subscriptions,
    COUNT(*) FILTER (WHERE trial_ends_at IS NOT NULL AND trial_ends_at <= now() + interval '7 days' AND subscription_status = 'trialing' AND is_template = false) as trials_ending_soon,
    COALESCE(
      (SELECT SUM(st.monthly_price_cents) 
       FROM public.organizations o 
       JOIN public.site_templates st ON o.subscription_tier = st.slug 
       WHERE o.subscription_status = 'active' AND o.is_template = false),
      0
    ) as monthly_recurring_revenue_cents
  FROM public.organizations
) sub
WHERE public.is_platform_admin(auth.uid());

GRANT SELECT ON public.platform_subscription_metrics TO authenticated;


-- 4. Eliminate Booking Race Conditions on availability_blocks
CREATE UNIQUE INDEX IF NOT EXISTS idx_availability_blocks_external_booking_id 
ON public.availability_blocks(external_booking_id) 
WHERE external_booking_id IS NOT NULL;
