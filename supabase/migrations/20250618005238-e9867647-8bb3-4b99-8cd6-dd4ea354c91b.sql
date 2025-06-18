
-- Add email verification tracking settings to site_settings table
INSERT INTO site_settings (key, value, created_by) 
VALUES 
  ('emailSetupVerified', 'false', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
  ('emailLastTestedAt', 'null', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
  ('emailVerificationDetails', '{}', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
ON CONFLICT (key) DO NOTHING;
