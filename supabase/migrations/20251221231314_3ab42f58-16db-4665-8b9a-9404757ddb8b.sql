-- Fix "Testing New Org" - remove template flag as it's not a real template
UPDATE public.organizations 
SET is_template = false 
WHERE slug = 'testing-new-org';