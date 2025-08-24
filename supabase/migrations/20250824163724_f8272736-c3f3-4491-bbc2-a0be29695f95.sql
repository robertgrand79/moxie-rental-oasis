-- Add global newsletter header and footer configuration to site_settings
INSERT INTO site_settings (key, value, created_by)
VALUES 
  ('newsletter_header_config', '{
    "title": "Moxie Vacation Rentals",
    "subtitle": "Your Home Base for Living Like a Local in Eugene", 
    "background_gradient": {
      "from": "hsl(220, 8%, 85%)",
      "to": "hsl(220, 3%, 97%)"
    },
    "text_color": "hsl(222.2, 47.4%, 11.2%)",
    "logo_url": ""
  }'::jsonb, (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1)),
  ('newsletter_footer_config', '{
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
  }'::jsonb, (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1))
ON CONFLICT (key) DO NOTHING;