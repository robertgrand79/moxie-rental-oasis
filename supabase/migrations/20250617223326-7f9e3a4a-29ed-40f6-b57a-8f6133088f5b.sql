
-- Add heroBackgroundImage to site_settings if it doesn't exist
-- This will store the uploaded hero image URL
INSERT INTO site_settings (key, value, created_by) 
SELECT 'heroBackgroundImage', '""'::jsonb, '00000000-0000-0000-0000-000000000000'::uuid
WHERE NOT EXISTS (
    SELECT 1 FROM site_settings WHERE key = 'heroBackgroundImage'
);
