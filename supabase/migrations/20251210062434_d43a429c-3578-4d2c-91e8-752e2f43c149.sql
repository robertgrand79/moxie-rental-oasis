-- Create a secure table for property payment credentials
-- This separates sensitive payment data from publicly-readable property info

CREATE TABLE IF NOT EXISTS public.property_stripe_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL UNIQUE REFERENCES public.properties(id) ON DELETE CASCADE,
  stripe_secret_key TEXT,
  stripe_publishable_key TEXT,
  stripe_webhook_secret TEXT,
  stripe_account_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_stripe_credentials ENABLE ROW LEVEL SECURITY;

-- Only admins and organization admins can view/manage credentials
-- NO public access whatsoever
CREATE POLICY "Admins can manage all stripe credentials"
  ON public.property_stripe_credentials
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Organization admins can manage property stripe credentials"
  ON public.property_stripe_credentials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_stripe_credentials.property_id
      AND can_manage_property(auth.uid(), p.id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_stripe_credentials.property_id
      AND can_manage_property(auth.uid(), p.id)
    )
  );

-- Migrate existing Stripe credentials from properties table
INSERT INTO public.property_stripe_credentials (property_id, stripe_secret_key, stripe_publishable_key, stripe_webhook_secret, stripe_account_id)
SELECT 
  id,
  stripe_secret_key,
  stripe_publishable_key,
  stripe_webhook_secret,
  stripe_account_id
FROM public.properties
WHERE stripe_secret_key IS NOT NULL 
   OR stripe_publishable_key IS NOT NULL 
   OR stripe_webhook_secret IS NOT NULL 
   OR stripe_account_id IS NOT NULL
ON CONFLICT (property_id) DO UPDATE SET
  stripe_secret_key = EXCLUDED.stripe_secret_key,
  stripe_publishable_key = EXCLUDED.stripe_publishable_key,
  stripe_webhook_secret = EXCLUDED.stripe_webhook_secret,
  stripe_account_id = EXCLUDED.stripe_account_id,
  updated_at = now();

-- Now remove the sensitive columns from the properties table
ALTER TABLE public.properties 
  DROP COLUMN IF EXISTS stripe_secret_key,
  DROP COLUMN IF EXISTS stripe_publishable_key,
  DROP COLUMN IF EXISTS stripe_webhook_secret,
  DROP COLUMN IF EXISTS stripe_account_id;

-- Create updated_at trigger for the new table
CREATE TRIGGER update_property_stripe_credentials_updated_at
  BEFORE UPDATE ON public.property_stripe_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create a SECURITY DEFINER function for edge functions to access credentials
-- This bypasses RLS but only returns credentials for valid property IDs
CREATE OR REPLACE FUNCTION public.get_property_stripe_credentials(p_property_id UUID)
RETURNS TABLE (
  stripe_secret_key TEXT,
  stripe_publishable_key TEXT,
  stripe_webhook_secret TEXT,
  stripe_account_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function is for server-side use only (edge functions)
  -- It returns credentials for a specific property
  RETURN QUERY
  SELECT 
    psc.stripe_secret_key,
    psc.stripe_publishable_key,
    psc.stripe_webhook_secret,
    psc.stripe_account_id
  FROM public.property_stripe_credentials psc
  WHERE psc.property_id = p_property_id;
END;
$$;