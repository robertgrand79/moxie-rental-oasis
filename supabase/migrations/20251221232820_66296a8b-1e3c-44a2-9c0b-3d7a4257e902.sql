-- Update the siteName to 'Stay Moxie' for the Moxie organization
UPDATE public.site_settings 
SET value = '"Stay Moxie"'
WHERE organization_id = 'a0000000-0000-0000-0000-000000000001' 
AND key = 'siteName';