
-- Add shellykanegrand@gmail.com to the Moxie Vacation Rentals organization
INSERT INTO organization_members (organization_id, user_id, role)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  '5f0a052a-239e-427a-8b26-b0f1cda5924c',
  'member'
);

-- Also update their profile to link to the organization
UPDATE profiles 
SET organization_id = 'a0000000-0000-0000-0000-000000000001'
WHERE id = '5f0a052a-239e-427a-8b26-b0f1cda5924c';
