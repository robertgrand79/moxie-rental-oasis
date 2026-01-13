-- Update existing organizations with pending status to active since wildcard DNS handles routing
UPDATE public.organizations 
SET subdomain_status = 'active', subdomain_error = null 
WHERE subdomain_status = 'pending' AND slug IS NOT NULL;