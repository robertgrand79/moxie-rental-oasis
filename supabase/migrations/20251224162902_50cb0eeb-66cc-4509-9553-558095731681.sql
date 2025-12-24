-- Help Categories table
CREATE TABLE public.help_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'HelpCircle',
  color TEXT NOT NULL DEFAULT 'bg-blue-500',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Help Articles table
CREATE TABLE public.help_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.help_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  article_type TEXT NOT NULL DEFAULT 'guide' CHECK (article_type IN ('getting_started', 'faq', 'troubleshooting', 'guide')),
  tags TEXT[] DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Help FAQs table
CREATE TABLE public.help_faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.help_categories(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'owner' CHECK (audience IN ('owner', 'guest', 'both')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.help_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_faqs ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Anyone can view active categories" ON public.help_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view published articles" ON public.help_articles
  FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can view published FAQs" ON public.help_faqs
  FOR SELECT USING (is_published = true);

-- Platform admins can manage all content
CREATE POLICY "Platform admins can manage categories" ON public.help_categories
  FOR ALL USING (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can manage articles" ON public.help_articles
  FOR ALL USING (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can manage FAQs" ON public.help_faqs
  FOR ALL USING (is_platform_admin(auth.uid()));

-- Seed default categories
INSERT INTO public.help_categories (name, slug, description, icon, color, sort_order) VALUES
  ('Getting Started', 'getting-started', 'Learn the basics of StayMoxie', 'Book', 'bg-blue-500', 1),
  ('Properties', 'properties', 'Managing your properties', 'Home', 'bg-green-500', 2),
  ('Bookings', 'bookings', 'Reservations and calendar management', 'Calendar', 'bg-purple-500', 3),
  ('Payments', 'payments', 'Billing and payment processing', 'CreditCard', 'bg-yellow-500', 4),
  ('Custom Domains', 'domains', 'Setting up your custom domain', 'Globe', 'bg-pink-500', 5),
  ('Team Management', 'team', 'Managing team members and roles', 'Users', 'bg-indigo-500', 6);

-- Seed getting started articles
INSERT INTO public.help_articles (category_id, title, content, article_type, sort_order) VALUES
  ((SELECT id FROM public.help_categories WHERE slug = 'getting-started'), 'Create Your Account', 'Sign up and set up your organization profile.', 'getting_started', 1),
  ((SELECT id FROM public.help_categories WHERE slug = 'getting-started'), 'Add Your First Property', 'Add property details, photos, and pricing.', 'getting_started', 2),
  ((SELECT id FROM public.help_categories WHERE slug = 'getting-started'), 'Customize Your Site', 'Brand your site with colors, logos, and content.', 'getting_started', 3),
  ((SELECT id FROM public.help_categories WHERE slug = 'getting-started'), 'Connect Calendars', 'Sync with Airbnb, VRBO, and other platforms.', 'getting_started', 4),
  ((SELECT id FROM public.help_categories WHERE slug = 'getting-started'), 'Publish & Share', 'Go live and start accepting direct bookings.', 'getting_started', 5);

-- Seed troubleshooting articles
INSERT INTO public.help_articles (category_id, title, content, article_type, sort_order) VALUES
  ((SELECT id FROM public.help_categories WHERE slug = 'bookings'), 'Calendar Not Syncing', 
   '1. Verify the iCal URL is correct and accessible\n2. Check if the external calendar has recent events\n3. Try removing and re-adding the calendar connection\n4. Wait 2-4 hours for the next sync cycle\n5. Contact support if issues persist', 
   'troubleshooting', 1),
  ((SELECT id FROM public.help_categories WHERE slug = 'domains'), 'Domain Not Connecting', 
   '1. Confirm DNS records match exactly (including trailing dots)\n2. Wait 24-48 hours for DNS propagation\n3. Check for typos in the domain name\n4. Verify the domain is not expired\n5. Contact your domain registrar for DNS issues', 
   'troubleshooting', 2),
  ((SELECT id FROM public.help_categories WHERE slug = 'payments'), 'Payment Failures', 
   '1. Verify your Stripe account is properly connected\n2. Check if the guest''s card was declined\n3. Ensure 3D Secure completed successfully\n4. Review Stripe dashboard for error details\n5. Contact guest to try a different payment method', 
   'troubleshooting', 3);

-- Seed Owner FAQs
INSERT INTO public.help_faqs (question, answer, audience, sort_order) VALUES
  ('How do I add a new property?', 'Go to Properties in the sidebar, click "Add Property", and fill in the details including address, description, amenities, photos, and pricing. Your property will be visible on your site immediately after saving.', 'owner', 1),
  ('How do I connect my Airbnb calendar?', 'Edit your property, scroll to the Calendar Sync section, and paste your Airbnb iCal export URL. You can find this in Airbnb under Listing > Availability > iCal. The calendar will sync automatically every few hours.', 'owner', 2),
  ('How do I set up a custom domain?', 'Go to Settings > Domain, enter your domain name, and add the provided DNS records to your domain registrar. Verification typically takes 24-48 hours. Once verified, your site will be accessible at your custom domain.', 'owner', 3),
  ('How do I change my subscription?', 'Navigate to Settings > Billing to view your current plan, upgrade or downgrade, update payment methods, and view billing history.', 'owner', 4),
  ('How do I export my bookings?', 'Go to Host Management > Bookings, use the filters to select the date range you want, then click the Export button to download a CSV file.', 'owner', 5),
  ('How do I set different prices for different seasons?', 'You can set seasonal pricing in the property editor under the Pricing tab. Add date ranges with specific prices, or connect PriceLabs for dynamic pricing.', 'owner', 6),
  ('How do I manage multiple team members?', 'Go to Settings > Users to invite team members, assign roles (Admin, Manager, Staff), and control their permissions.', 'owner', 7),
  ('How do I view my analytics and reports?', 'Visit the Reports section in the sidebar to see occupancy rates, revenue, booking trends, and more. Export reports for accounting or analysis.', 'owner', 8);

-- Seed Guest FAQs
INSERT INTO public.help_faqs (question, answer, audience, sort_order) VALUES
  ('How do I book a property?', 'Select your dates on the property page, enter guest count, and click Book Now. You''ll be guided through payment and confirmation.', 'guest', 1),
  ('What''s the cancellation policy?', 'Cancellation policies vary by property. Check the booking details before confirming. Common policies include Flexible, Moderate, and Strict.', 'guest', 2),
  ('How do I contact the owner?', 'After booking, you can message the owner through the guest portal or use the contact information in your confirmation email.', 'guest', 3),
  ('When do I get check-in instructions?', 'Check-in instructions are typically sent 24-48 hours before your arrival. You can also access them in the guest portal.', 'guest', 4),
  ('Can I modify my booking?', 'Contact the property owner to request modifications. Changes to dates or guest count may affect pricing.', 'guest', 5);

-- Create indexes for better performance
CREATE INDEX idx_help_articles_category ON public.help_articles(category_id);
CREATE INDEX idx_help_articles_type ON public.help_articles(article_type);
CREATE INDEX idx_help_faqs_audience ON public.help_faqs(audience);
CREATE INDEX idx_help_categories_slug ON public.help_categories(slug);