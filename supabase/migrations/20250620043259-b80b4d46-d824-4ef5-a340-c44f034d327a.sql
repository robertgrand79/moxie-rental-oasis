
-- Add a public read policy for site_settings table
-- This allows anonymous users to read specific public settings
CREATE POLICY "Allow public read access to public settings" 
ON public.site_settings 
FOR SELECT 
USING (
  key IN (
    'siteName',
    'tagline', 
    'description',
    'heroTitle',
    'heroSubtitle',
    'heroDescription',
    'heroBackgroundImage',
    'heroLocationText',
    'heroRating',
    'heroCTAText',
    'contactEmail',
    'phone',
    'address',
    'socialMedia',
    'siteTitle',
    'metaDescription',
    'ogTitle',
    'ogDescription',
    'ogImage',
    'favicon'
  )
);
