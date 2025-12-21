-- Create organization_templates table for dedicated template management
CREATE TABLE public.organization_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('single_property', 'multi_property')),
  preview_image_url TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]'::jsonb,
  default_settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organization_templates ENABLE ROW LEVEL SECURITY;

-- Public read access for active templates (used during signup)
CREATE POLICY "Anyone can view active templates"
ON public.organization_templates
FOR SELECT
USING (is_active = true);

-- Only platform admins can manage templates
CREATE POLICY "Platform admins can manage templates"
ON public.organization_templates
FOR ALL
USING (is_platform_admin(auth.uid()));

-- Trigger to update updated_at
CREATE TRIGGER update_organization_templates_updated_at
BEFORE UPDATE ON public.organization_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial templates
INSERT INTO public.organization_templates (name, slug, description, template_type, display_order, features, default_settings) VALUES
(
  'Mountain Retreat',
  'mountain-retreat-template',
  'A stunning single-property template perfect for showcasing your vacation rental with beautiful imagery and seamless booking.',
  'single_property',
  1,
  '["Online Booking", "Guest Portal", "Photo Gallery", "Local Area Guide", "Reviews Integration"]'::jsonb,
  '{"theme": "modern", "color_scheme": "earth_tones"}'::jsonb
),
(
  'Portfolio Pro',
  'portfolio-pro-template',
  'Professional multi-property template designed for property managers with multiple listings. Includes search, filtering, and portfolio management.',
  'multi_property',
  2,
  '["Property Search", "Advanced Filtering", "Multi-Calendar", "Team Management", "Analytics Dashboard", "Bulk Messaging"]'::jsonb,
  '{"theme": "professional", "color_scheme": "neutral"}'::jsonb
);

-- Index for faster lookups
CREATE INDEX idx_organization_templates_type ON public.organization_templates(template_type);
CREATE INDEX idx_organization_templates_active ON public.organization_templates(is_active, display_order);