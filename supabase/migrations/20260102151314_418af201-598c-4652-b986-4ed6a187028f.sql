-- Create platform_blog_posts table for StayMoxie marketing blog
CREATE TABLE public.platform_blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'StayMoxie Team',
  category TEXT,
  image_url TEXT,
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_featured BOOLEAN DEFAULT false,
  read_time TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.platform_blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Anyone can read published platform blog posts"
ON public.platform_blog_posts
FOR SELECT
USING (status = 'published');

-- Platform admins can manage all posts
CREATE POLICY "Platform admins can manage platform blog posts"
ON public.platform_blog_posts
FOR ALL
USING (public.is_platform_admin(auth.uid()));

-- Create index for faster querying
CREATE INDEX idx_platform_blog_posts_status ON public.platform_blog_posts(status);
CREATE INDEX idx_platform_blog_posts_slug ON public.platform_blog_posts(slug);
CREATE INDEX idx_platform_blog_posts_published_at ON public.platform_blog_posts(published_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_platform_blog_posts_updated_at
BEFORE UPDATE ON public.platform_blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial blog posts
INSERT INTO public.platform_blog_posts (title, slug, excerpt, content, category, author, read_time, status, published_at) VALUES
('10 Strategies to Increase Your Direct Booking Rate', 'increase-direct-booking-rate', 'Learn proven tactics to reduce OTA dependency and boost your direct booking revenue by up to 50%.', '<p>Direct bookings are the holy grail for vacation rental hosts. They mean higher margins, better guest relationships, and more control over your business.</p><h2>1. Build a Professional Website</h2><p>Your website is your digital storefront. Make it count with professional photos, clear booking calls-to-action, and mobile optimization.</p><h2>2. Leverage Email Marketing</h2><p>Build an email list and nurture past guests with personalized offers and local content.</p>', 'Direct Bookings', 'StayMoxie Team', '8 min', 'published', now()),
('The Ultimate Guide to Local SEO for Vacation Rentals', 'local-seo-vacation-rentals', 'How to optimize your vacation rental website to rank higher in local search results and attract more guests.', '<p>Local SEO is essential for vacation rental hosts who want to be found by travelers searching for accommodations in their area.</p><h2>Optimize Your Google Business Profile</h2><p>Claim and fully optimize your Google Business Profile with accurate information, photos, and regular updates.</p><h2>Create Local Content</h2><p>Write blog posts about local attractions, events, and insider tips that travelers are searching for.</p>', 'Marketing', 'StayMoxie Team', '12 min', 'published', now()),
('Why Your Vacation Rental Needs a Content Hub', 'vacation-rental-content-hub', 'Discover how creating local content can establish your authority and drive organic bookings year-round.', '<p>A content hub positions you as the local expert and gives travelers a reason to visit your website beyond just booking.</p><h2>What is a Content Hub?</h2><p>A content hub is a collection of valuable resources about your destination - from local guides to event calendars to insider tips.</p>', 'Content Strategy', 'StayMoxie Team', '6 min', 'published', now());