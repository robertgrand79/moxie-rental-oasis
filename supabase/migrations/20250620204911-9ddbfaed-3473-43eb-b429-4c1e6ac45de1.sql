
-- Add access_code field to work_orders table
ALTER TABLE public.work_orders 
ADD COLUMN IF NOT EXISTS access_code TEXT;

-- Add site settings for contact phone number
INSERT INTO public.site_settings (key, value, created_by)
VALUES (
  'contactPhone', 
  '"(541) 555-0123"'::jsonb,
  (SELECT id FROM auth.users LIMIT 1)
) 
ON CONFLICT (key) DO NOTHING;
