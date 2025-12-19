-- Create contractor access tokens table for persistent token-based access
CREATE TABLE public.contractor_access_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create index for fast token lookups
CREATE INDEX idx_contractor_access_tokens_token ON public.contractor_access_tokens(token);
CREATE INDEX idx_contractor_access_tokens_contractor ON public.contractor_access_tokens(contractor_id);

-- Enable RLS
ALTER TABLE public.contractor_access_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Organization members can view tokens for contractors in their org
CREATE POLICY "Organization members can view contractor tokens"
ON public.contractor_access_tokens
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.contractors c
    WHERE c.id = contractor_id
    AND user_belongs_to_organization(auth.uid(), c.organization_id)
  )
);

-- Policy: Organization admins can manage tokens
CREATE POLICY "Organization admins can manage contractor tokens"
ON public.contractor_access_tokens
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.contractors c
    WHERE c.id = contractor_id
    AND user_is_org_admin(auth.uid(), c.organization_id)
  )
);

-- Policy: System can insert/update tokens (for edge functions)
CREATE POLICY "System can manage tokens"
ON public.contractor_access_tokens
FOR ALL
USING (auth.role() = 'service_role');

-- Add completion_photos column to work_orders if it doesn't exist
ALTER TABLE public.work_orders 
ADD COLUMN IF NOT EXISTS completion_photos TEXT[] DEFAULT '{}';

-- Add contractor_notes column for contractor to add notes
ALTER TABLE public.work_orders 
ADD COLUMN IF NOT EXISTS contractor_notes TEXT;

-- Function to get or create contractor access token
CREATE OR REPLACE FUNCTION public.get_or_create_contractor_token(p_contractor_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- Try to get existing active token
  SELECT token INTO v_token
  FROM public.contractor_access_tokens
  WHERE contractor_id = p_contractor_id
    AND is_active = true
  LIMIT 1;
  
  -- If no token exists, create one
  IF v_token IS NULL THEN
    INSERT INTO public.contractor_access_tokens (contractor_id)
    VALUES (p_contractor_id)
    RETURNING token INTO v_token;
  END IF;
  
  RETURN v_token;
END;
$$;