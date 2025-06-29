
-- Add new columns to blog_posts table to support unified content management
ALTER TABLE public.blog_posts 
ADD COLUMN content_type text NOT NULL DEFAULT 'article'::text,
ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb,
ADD COLUMN category text,
ADD COLUMN display_order integer DEFAULT 0,
ADD COLUMN is_featured boolean DEFAULT false,
ADD COLUMN is_active boolean DEFAULT true,
ADD COLUMN location text,
ADD COLUMN latitude numeric,
ADD COLUMN longitude numeric,
ADD COLUMN event_date date,
ADD COLUMN end_date date,
ADD COLUMN time_start text,
ADD COLUMN time_end text,
ADD COLUMN website_url text,
ADD COLUMN ticket_url text,
ADD COLUMN price_range text,
ADD COLUMN rating numeric,
ADD COLUMN phone text,
ADD COLUMN address text,
ADD COLUMN activity_type text,
ADD COLUMN is_recurring boolean DEFAULT false,
ADD COLUMN recurrence_pattern text;

-- Add constraint to ensure content_type is one of the valid values
ALTER TABLE public.blog_posts 
ADD CONSTRAINT blog_posts_content_type_check 
CHECK (content_type IN ('article', 'event', 'poi', 'lifestyle'));

-- Add constraint to ensure rating is between 1 and 5 if provided
ALTER TABLE public.blog_posts 
ADD CONSTRAINT blog_posts_rating_check 
CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

-- Create indexes for better query performance
CREATE INDEX idx_blog_posts_content_type ON public.blog_posts(content_type);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_is_featured ON public.blog_posts(is_featured);
CREATE INDEX idx_blog_posts_is_active ON public.blog_posts(is_active);
CREATE INDEX idx_blog_posts_event_date ON public.blog_posts(event_date);
CREATE INDEX idx_blog_posts_location ON public.blog_posts(location);
CREATE INDEX idx_blog_posts_display_order ON public.blog_posts(display_order);

-- Create composite indexes for common queries
CREATE INDEX idx_blog_posts_type_status ON public.blog_posts(content_type, status, is_active);
CREATE INDEX idx_blog_posts_featured_order ON public.blog_posts(is_featured, display_order) WHERE is_active = true;
