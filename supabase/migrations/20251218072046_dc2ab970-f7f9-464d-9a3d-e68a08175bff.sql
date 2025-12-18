-- Drop apify_api_key column from organizations table
ALTER TABLE public.organizations DROP COLUMN IF EXISTS apify_api_key;