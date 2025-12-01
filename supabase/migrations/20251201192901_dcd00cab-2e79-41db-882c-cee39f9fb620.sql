-- Add PriceLabs API key to organizations table for multi-tenant support
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS pricelabs_api_key TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.organizations.pricelabs_api_key IS 'PriceLabs API key for this organization';

-- Create a sync_logs table for PriceLabs sync tracking
CREATE TABLE IF NOT EXISTS public.pricelabs_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'pending',
  prices_synced INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pricelabs_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for sync logs
CREATE POLICY "Users can view sync logs in their organization"
  ON public.pricelabs_sync_logs
  FOR SELECT
  USING (user_belongs_to_organization(auth.uid(), organization_id));

CREATE POLICY "System can insert sync logs"
  ON public.pricelabs_sync_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update sync logs"
  ON public.pricelabs_sync_logs
  FOR UPDATE
  USING (true);