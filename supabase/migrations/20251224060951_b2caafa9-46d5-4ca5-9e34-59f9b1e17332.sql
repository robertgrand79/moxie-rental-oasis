-- Add legal compliance columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT FALSE;

-- Add index for marketing opt-in queries
CREATE INDEX IF NOT EXISTS idx_profiles_marketing_opt_in ON public.profiles(marketing_opt_in) WHERE marketing_opt_in = true;

-- Comment on columns
COMMENT ON COLUMN public.profiles.terms_accepted_at IS 'Timestamp when user accepted Terms of Service';
COMMENT ON COLUMN public.profiles.privacy_accepted_at IS 'Timestamp when user accepted Privacy Policy';
COMMENT ON COLUMN public.profiles.marketing_opt_in IS 'Whether user has opted into marketing communications';