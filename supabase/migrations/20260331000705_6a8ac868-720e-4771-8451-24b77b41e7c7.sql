
CREATE OR REPLACE VIEW public.platform_subscription_metrics AS
SELECT 
  COUNT(*) FILTER (WHERE subscription_status = 'active' AND is_template = false) as active_subscriptions,
  COUNT(*) FILTER (WHERE subscription_status = 'trialing' AND is_template = false) as trial_subscriptions,
  COUNT(*) FILTER (WHERE subscription_status = 'canceled' AND is_template = false) as canceled_subscriptions,
  COUNT(*) FILTER (WHERE subscription_status = 'past_due' AND is_template = false) as past_due_subscriptions,
  COUNT(*) FILTER (WHERE subscription_status = 'comped' AND is_template = false) as comped_subscriptions,
  COUNT(*) FILTER (WHERE trial_ends_at IS NOT NULL AND trial_ends_at <= now() + interval '7 days' AND subscription_status = 'trialing' AND is_template = false) as trials_ending_soon,
  COALESCE(
    (SELECT SUM(
      CASE 
        WHEN o.discount_percent IS NOT NULL AND o.discount_percent > 0 
        THEN st.monthly_price_cents * (100 - o.discount_percent) / 100
        ELSE st.monthly_price_cents
      END
    )
     FROM public.organizations o 
     JOIN public.site_templates st ON o.subscription_tier = st.slug 
     WHERE o.subscription_status = 'active' AND o.is_template = false),
    0
  ) as monthly_recurring_revenue_cents
FROM public.organizations;
