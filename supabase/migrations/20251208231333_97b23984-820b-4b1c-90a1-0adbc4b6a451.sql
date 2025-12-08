-- Create platform_settings table for platform-level configuration
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  is_secret BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only platform admins can read platform settings
CREATE POLICY "Platform admins can read platform settings"
ON public.platform_settings
FOR SELECT
USING (public.is_platform_admin(auth.uid()));

-- Only platform admins can manage platform settings
CREATE POLICY "Platform admins can manage platform settings"
ON public.platform_settings
FOR ALL
USING (public.is_platform_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial settings (empty values - to be configured in admin)
INSERT INTO public.platform_settings (key, is_secret) VALUES
  ('platform_stripe_secret_key', true),
  ('platform_stripe_publishable_key', false),
  ('platform_stripe_webhook_secret', true);

-- Create site_templates table for managing subscription tiers
CREATE TABLE public.site_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  monthly_price_cents INTEGER NOT NULL,
  annual_price_cents INTEGER,
  max_properties INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can read active templates (for pricing page)
CREATE POLICY "Anyone can view active templates"
ON public.site_templates
FOR SELECT
USING (is_active = true);

-- Platform admins can manage all templates
CREATE POLICY "Platform admins can manage templates"
ON public.site_templates
FOR ALL
USING (public.is_platform_admin(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_site_templates_updated_at
BEFORE UPDATE ON public.site_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial templates
INSERT INTO public.site_templates (name, slug, description, monthly_price_cents, annual_price_cents, max_properties, features, display_order) VALUES
  (
    'Single Property',
    'single_property',
    'Perfect for owners with one vacation rental property',
    7999,
    7999,
    1,
    '["Custom branded website", "Direct booking engine", "Stripe payment processing", "Guest communication tools", "Digital guidebook", "Calendar sync with Airbnb/VRBO"]'::jsonb,
    1
  ),
  (
    'Multi-Property Portfolio',
    'multi_property',
    'For property managers with multiple vacation rentals',
    11999,
    11999,
    NULL,
    '["Everything in Single Property", "Unlimited properties", "Property search & listings", "Multi-property calendar", "Team member access", "Advanced analytics"]'::jsonb,
    2
  );

-- Add stripe_customer_id to organizations if not exists
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;