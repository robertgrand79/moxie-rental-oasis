-- Migration: Add template source system columns
-- Description: Enhance organizations and organization_templates for robust template management

-- 1. Add columns to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS is_template_source boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS template_category text;

-- 2. Add columns to organization_templates table
ALTER TABLE organization_templates
ADD COLUMN IF NOT EXISTS preview_url text,
ADD COLUMN IF NOT EXISTS preview_images jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS feature_highlights jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS recommended_for text[] DEFAULT '{}';

-- 3. Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_organizations_template_source 
ON organizations (is_template_source) 
WHERE is_template_source = true;

CREATE INDEX IF NOT EXISTS idx_organizations_template_category 
ON organizations (template_category) 
WHERE is_template_source = true;

-- 4. Add comments for documentation
COMMENT ON COLUMN organizations.is_template_source IS 
  'True if this organization serves as a demo data source for visual templates';
COMMENT ON COLUMN organizations.template_category IS 
  'Template tier category: single, multi, luxury';
COMMENT ON COLUMN organization_templates.preview_url IS 
  'URL path to live demo site for this template';
COMMENT ON COLUMN organization_templates.preview_images IS 
  'Array of screenshot URLs for template preview gallery';
COMMENT ON COLUMN organization_templates.feature_highlights IS 
  'Array of key feature strings for marketing display';
COMMENT ON COLUMN organization_templates.recommended_for IS 
  'Array of target audience types: vacation_rental, bnb, property_manager, etc.';

-- 5. Migrate existing template organizations
UPDATE organizations
SET 
  is_template_source = true,
  template_category = CASE 
    WHEN template_type = 'single_property' THEN 'single'
    WHEN template_type = 'multi_property' THEN 'multi'
    ELSE NULL
  END
WHERE is_template = true AND is_template_source IS NOT TRUE;