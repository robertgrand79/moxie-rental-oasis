
-- Update existing blog posts to change author from "Admin" to "Moxie Team"
UPDATE blog_posts 
SET author = 'Moxie Team' 
WHERE author = 'Admin';
