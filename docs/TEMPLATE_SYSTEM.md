# Template System Documentation

This document explains how the StayMoxie template system works and how to create new templates.

## Overview

The template system consists of three interconnected components:

1. **Pricing Tiers** (`site_templates` table) - Define pricing and feature sets
2. **Visual Templates** (`organization_templates` table) - Define the look and configuration
3. **Source Organizations** (`organizations` with `is_template_source=true`) - Provide demo content

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   Pricing Tier      │     │  Visual Template    │     │  Source Org         │
│   (site_templates)  │◄────│  (org_templates)    │────►│  (organizations)    │
│                     │     │                     │     │                     │
│ - name: "Starter"   │     │ - name: "Starter"   │     │ - is_template_source│
│ - price: 7900       │     │ - pricing_tier_id   │     │ - Demo properties   │
│ - features[]        │     │ - source_org_id     │     │ - Demo blog posts   │
│ - stripe_price_id   │     │ - demo_data_config  │     │ - Demo testimonials │
└─────────────────────┘     │ - template_type     │     │ - Site settings     │
                            └─────────────────────┘     └─────────────────────┘
```

## How Template Creation Works

When a user creates an organization from a template:

1. **Template Lookup**: The `create_organization_with_owner` function looks up the visual template
2. **Source Resolution**: Gets the `source_organization_id` and `demo_data_config`
3. **Organization Creation**: Creates new org with `template_type` and `created_from_template_id`
4. **Settings Copy**: Copies `site_settings` from source org (branding, fonts, colors)
5. **Demo Data Copy**: If enabled, runs `copy_organization_demo_data` to copy:
   - Properties (with images, amenities, spaces)
   - Blog posts
   - Static pages
   - Testimonials
   - Points of interest
   - Lifestyle gallery
   - Message templates
   - Checklist templates
6. **Default Fallbacks**: Creates default settings for any missing values
7. **Logging**: Records the creation in `application_logs`

## Creating a New Template

### Step 1: Create the Source Organization

The source organization contains the demo content that will be copied to new orgs.

```sql
-- Create the source organization
INSERT INTO organizations (
  name,
  slug,
  is_template,
  is_template_source,
  template_type,
  is_active
) VALUES (
  'StayMoxie Luxury Template',
  'staymoxie-template-luxury',
  true,
  true,
  'single_property',
  true
);
```

### Step 2: Populate Demo Content

Add demo data to your source organization:

1. **Properties**: Create sample properties with images, amenities, and room configurations
2. **Blog Posts**: Add 3-5 sample blog posts (will be copied as drafts)
3. **Testimonials**: Add 3-5 guest reviews
4. **Points of Interest**: Add local attractions and recommendations
5. **Lifestyle Gallery**: Add hero/gallery images
6. **Message Templates**: Add automated guest communication templates
7. **Site Settings**: Configure branding (logo, colors, fonts, hero text)

### Step 3: Create/Use a Pricing Tier

Either use an existing tier or create a new one:

```sql
-- Check existing tiers
SELECT id, name, price, features FROM site_templates;

-- Or create a new tier
INSERT INTO site_templates (
  name,
  price,           -- in cents (7900 = $79)
  annual_price,    -- in cents (71100 = $711/year = $59.25/mo)
  features,
  is_active
) VALUES (
  'Luxury',
  19900,
  179100,
  '["Unlimited Properties", "AI Concierge", "Priority Support", "Custom Domain", "White Label"]'::jsonb,
  true
);
```

### Step 4: Create the Visual Template

Link everything together:

```sql
INSERT INTO organization_templates (
  name,
  description,
  slug,
  template_type,
  pricing_tier_id,
  source_organization_id,
  include_demo_data,
  demo_data_config,
  feature_highlights,
  recommended_for,
  is_active,
  display_order
) VALUES (
  'Luxury',
  'Premium template for luxury vacation rentals with white-glove service',
  'luxury',
  'single_property',
  (SELECT id FROM site_templates WHERE name = 'Luxury'),
  (SELECT id FROM organizations WHERE slug = 'staymoxie-template-luxury'),
  true,
  '{
    "properties": true,
    "blog_posts": true,
    "testimonials": true,
    "points_of_interest": true,
    "message_templates": true,
    "lifestyle_gallery": true,
    "checklist_templates": true
  }'::jsonb,
  '["AI Concierge", "White Label Branding", "Priority Support", "Custom Domain"]'::jsonb,
  '["luxury_rental", "high_end_vacation", "boutique_hotel"]'::jsonb,
  true,
  3
);
```

### Step 5: Test the Template

1. Go to `/admin/platform/template-test` (Super Admin only)
2. Find your new template in the list
3. Click "Test Template" to validate:
   - Source organization exists
   - Pricing tier is linked
   - Demo data config is set
   - Organization creation works
   - Site settings copy correctly
   - Demo data copies correctly
4. Review the test results
5. Click "Cleanup" to delete test organizations

## Demo Data Configuration

The `demo_data_config` JSON controls what gets copied:

```json
{
  "properties": true,        // Copy properties + images + amenities + spaces
  "blog_posts": true,        // Copy blog posts (as drafts)
  "pages": true,             // Copy static pages (unpublished)
  "testimonials": true,      // Copy guest reviews
  "points_of_interest": true,// Copy local attractions
  "message_templates": true, // Copy automated messages
  "lifestyle_gallery": true, // Copy gallery images
  "checklist_templates": true,// Copy maintenance checklists
  "events": false            // Copy events (shifted 30 days forward)
}
```

## Template Types

- `single_property`: For hosts with one vacation rental
- `multi_property`: For property managers with multiple rentals

This affects:
- Default navigation structure
- Property list vs single property display
- Onboarding flow focus

## Template Categories

Used for filtering and organization:

- `single`: Single property templates
- `multi`: Multi-property/portfolio templates
- `luxury`: Premium/luxury tier templates

## Feature Highlights

Marketing copy shown in template selection:

```json
["AI Chat Assistant", "Direct Booking", "Automated Messages", "Guest Portal"]
```

## Recommended For

Tags used for template recommendations:

```json
["cabin_rental", "vacation_home", "single_property_owner"]
```

## Troubleshooting

### Demo data not copying

1. Check `source_organization_id` is correct
2. Verify source org has content to copy
3. Check `demo_data_config` has the content types enabled
4. Look at `application_logs` for errors:
   ```sql
   SELECT * FROM application_logs 
   WHERE tags @> ARRAY['demo-data'] 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

### Template not showing in signup

1. Verify `is_active = true`
2. Check `pricing_tier_id` links to an active tier
3. Verify the template query in `useOrganizationTemplates`

### Site settings not copying

1. Check source org has `site_settings` records
2. Verify no conflicts with default settings keys
3. Check `application_logs` for copy operations

## Database Schema Reference

### organization_templates

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Display name |
| description | text | Marketing description |
| slug | text | URL-safe identifier |
| template_type | text | 'single_property' or 'multi_property' |
| pricing_tier_id | uuid | FK to site_templates |
| source_organization_id | uuid | FK to organizations |
| include_demo_data | boolean | Default demo data toggle |
| demo_data_config | jsonb | What content to copy |
| feature_highlights | jsonb | Marketing features array |
| recommended_for | jsonb | Target audience tags |
| preview_url | text | Live demo site URL |
| preview_images | jsonb | Gallery image URLs |
| is_active | boolean | Show in selection |
| display_order | int | Sort order |

### Key Functions

- `create_organization_with_owner()`: Main org creation with template support
- `copy_organization_demo_data()`: Copies demo content based on config
- `is_slug_available()`: Checks URL availability

## Adding Templates via Super Admin

For non-technical users, use the Super Admin panel:

1. Go to `/admin/platform`
2. Navigate to "Templates" section
3. Click "Add Template"
4. Fill in the form:
   - Name and description
   - Select pricing tier
   - Select source organization
   - Configure demo data options
   - Add feature highlights
5. Save and test using the test page
