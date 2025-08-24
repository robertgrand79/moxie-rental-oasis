-- Add global newsletter header and footer configuration to site_settings
-- First check if there are any users, if not, use a default UUID
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Try to get the first admin user
    SELECT id INTO admin_user_id 
    FROM profiles 
    WHERE role = 'admin' 
    LIMIT 1;
    
    -- If no admin user found, try to get any user
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id 
        FROM profiles 
        LIMIT 1;
    END IF;
    
    -- If still no user found, use a default UUID (this shouldn't happen in production)
    IF admin_user_id IS NULL THEN
        admin_user_id := '00000000-0000-0000-0000-000000000000';
    END IF;

    -- Insert the newsletter configuration settings
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
      }'::jsonb, admin_user_id),
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
      }'::jsonb, admin_user_id)
    ON CONFLICT (key) DO NOTHING;
END $$;