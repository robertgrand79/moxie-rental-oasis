-- Mark Moxie Vacation Rentals as the template organization
UPDATE organizations 
SET is_template = true 
WHERE id = 'a0000000-0000-0000-0000-000000000001';