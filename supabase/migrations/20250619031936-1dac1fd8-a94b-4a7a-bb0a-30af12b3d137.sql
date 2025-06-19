
-- Enhance newsletter_subscribers table with multi-channel capabilities
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS sms_opt_in BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_opt_in BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS communication_preferences JSONB DEFAULT '{"frequency": "weekly", "preferred_time": "morning"}'::jsonb,
ADD COLUMN IF NOT EXISTS contact_source TEXT DEFAULT 'newsletter',
ADD COLUMN IF NOT EXISTS last_engagement_date TIMESTAMP WITH TIME ZONE;

-- Update existing records to have email_opt_in = true for active subscribers
UPDATE public.newsletter_subscribers 
SET email_opt_in = is_active, 
    contact_source = 'newsletter',
    last_engagement_date = updated_at
WHERE email_opt_in IS NULL;

-- Create index for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_phone ON public.newsletter_subscribers(phone);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_sms_opt_in ON public.newsletter_subscribers(sms_opt_in);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_contact_source ON public.newsletter_subscribers(contact_source);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_last_engagement ON public.newsletter_subscribers(last_engagement_date);

-- Add constraint to ensure at least one communication method is selected
ALTER TABLE public.newsletter_subscribers 
ADD CONSTRAINT check_communication_method 
CHECK (email_opt_in = true OR sms_opt_in = true);
