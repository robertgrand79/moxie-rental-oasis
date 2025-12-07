-- Fix the unique constraint to support multi-tenant
-- Drop the old constraint and add new composite constraint
ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_settings_key_key;

-- Add composite unique constraint on organization_id and key
ALTER TABLE public.site_settings ADD CONSTRAINT site_settings_org_key_unique UNIQUE (organization_id, key);