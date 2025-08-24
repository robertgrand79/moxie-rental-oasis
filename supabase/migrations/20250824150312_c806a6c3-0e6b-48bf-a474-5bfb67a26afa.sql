-- Add header and footer configuration columns to newsletter campaigns
ALTER TABLE public.newsletter_campaigns 
ADD COLUMN IF NOT EXISTS header_config jsonb DEFAULT '{
  "title": "Moxie Vacation Rentals",
  "subtitle": "Your Home Base for Living Like a Local in Eugene",
  "background_gradient": {
    "from": "hsl(220, 8%, 85%)",
    "to": "hsl(220, 3%, 97%)"
  },
  "text_color": "hsl(222.2, 47.4%, 11.2%)",
  "logo_url": ""
}'::jsonb,
ADD COLUMN IF NOT EXISTS footer_config jsonb DEFAULT '{
  "company_name": "Moxie Vacation Rentals",
  "tagline": "Your Home Base for Living Like a Local in Eugene",
  "contact_info": {
    "email": "contact@moxievacationrentals.com",
    "location": "Eugene, Oregon"
  },
  "links": [
    {"text": "Visit Our Website", "url": "#"},
    {"text": "View Properties", "url": "#"}
  ],
  "legal_links": [
    {"text": "Unsubscribe", "url": "#"},
    {"text": "Update Preferences", "url": "#"}
  ],
  "social_media": {
    "facebook": "",
    "instagram": "",
    "twitter": ""
  }
}'::jsonb;