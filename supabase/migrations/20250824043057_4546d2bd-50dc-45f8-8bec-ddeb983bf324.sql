-- Update newsletter_campaigns table to support multiple content references
ALTER TABLE newsletter_campaigns 
ADD COLUMN linked_content jsonb DEFAULT '{
  "blog_posts": [],
  "events": [],
  "places": []
}'::jsonb;