-- Fix Shelly Kane's organization member role to match her profile role
UPDATE public.organization_members 
SET role = 'admin' 
WHERE user_id = '5f0a052a-239e-427a-8b26-b0f1cda5924c';