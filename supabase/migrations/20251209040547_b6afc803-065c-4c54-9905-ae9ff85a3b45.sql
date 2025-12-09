-- Update existing blog posts with NULL organization_id to use Moxie Vacation Rentals org
UPDATE blog_posts 
SET organization_id = 'a0000000-0000-0000-0000-000000000001'
WHERE organization_id IS NULL;