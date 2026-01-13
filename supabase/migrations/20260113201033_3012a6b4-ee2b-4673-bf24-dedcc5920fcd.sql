-- Create platform billing/subscription tracking table for failed payments
CREATE TABLE public.platform_failed_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  failure_reason TEXT,
  failure_code TEXT,
  attempt_count INTEGER DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  next_retry_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'retrying', 'resolved', 'written_off')),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  invoice_metadata JSONB,
  email_alert_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_failed_payments ENABLE ROW LEVEL SECURITY;

-- Create policy for platform admins only
CREATE POLICY "Platform admins can manage failed payments"
ON public.platform_failed_payments
FOR ALL
USING (is_platform_admin(auth.uid()))
WITH CHECK (is_platform_admin(auth.uid()));

-- Create index for quick lookups
CREATE INDEX idx_failed_payments_org ON public.platform_failed_payments(organization_id);
CREATE INDEX idx_failed_payments_status ON public.platform_failed_payments(status);
CREATE INDEX idx_failed_payments_created ON public.platform_failed_payments(created_at DESC);

-- Add subscription revenue tracking view
CREATE OR REPLACE VIEW public.platform_subscription_metrics AS
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
FROM public.organizations;

-- Grant access to the view
GRANT SELECT ON public.platform_subscription_metrics TO authenticated;

-- Create trigger for updated_at
CREATE TRIGGER update_platform_failed_payments_updated_at
BEFORE UPDATE ON public.platform_failed_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();