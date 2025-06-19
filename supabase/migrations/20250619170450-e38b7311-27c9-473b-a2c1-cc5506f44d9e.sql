
-- Add image_credit column to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN image_credit text;

-- Add comment to describe the column
COMMENT ON COLUMN public.blog_posts.image_credit IS 'HTML credit string for featured images, typically from Unsplash or other photo sources';
