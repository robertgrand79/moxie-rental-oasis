-- Fix orphaned testimonials by assigning them to a valid Moxie property
-- Reassign testimonials with NULL property_id to Moxie Harris Bungalow
UPDATE testimonials 
SET property_id = '4fe1f5e4-d4fd-45aa-a802-84f1d939669c'
WHERE property_id IS NULL;

-- Reassign testimonials with deleted property reference to Moxie Harris Bungalow
UPDATE testimonials 
SET property_id = '4fe1f5e4-d4fd-45aa-a802-84f1d939669c'
WHERE property_id = 'ae47ca69-b664-474f-b33a-fc2c1de7a6eb';

-- Add logo URL to Moxie organization's site_settings
INSERT INTO site_settings (organization_id, key, value, created_by)
VALUES (
  'a0000000-0000-0000-0000-000000000001', 
  'siteLogo', 
  '"https://joiovubyokikqjytxtuv.supabase.co/storage/v1/object/public/organization-logos/95758e12-f900-49f5-9f22-0fad1d53b8b8-1765138898364.svg"'::jsonb,
  '5e338471-fb23-4b34-9f98-b994ccae47f7'
)
ON CONFLICT (organization_id, key) DO UPDATE SET value = EXCLUDED.value;