-- Add calendar export token to properties for secure iCal exports
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS calendar_export_token text DEFAULT encode(extensions.gen_random_bytes(16), 'hex');

-- Add index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_properties_calendar_export_token 
ON public.properties(calendar_export_token);

-- Add calendar sync audit fields
ALTER TABLE public.external_calendars 
ADD COLUMN IF NOT EXISTS consecutive_failures integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_failure_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS events_count integer DEFAULT 0;

-- Create a table to track calendar sync history for monitoring
CREATE TABLE IF NOT EXISTS public.calendar_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_calendar_id uuid REFERENCES public.external_calendars(id) ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  platform text NOT NULL,
  sync_type text NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'manual', 'initial'
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'
  events_synced integer DEFAULT 0,
  events_removed integer DEFAULT 0,
  error_message text,
  duration_ms integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on calendar_sync_logs
ALTER TABLE public.calendar_sync_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view sync logs for their organization's properties
CREATE POLICY "Users can view sync logs for their properties"
ON public.calendar_sync_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.organization_members om ON om.organization_id = p.organization_id
    WHERE p.id = calendar_sync_logs.property_id
    AND om.user_id = auth.uid()
  )
  OR public.is_platform_admin(auth.uid())
);

-- Add function to reset export token
CREATE OR REPLACE FUNCTION public.regenerate_calendar_export_token(p_property_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_token text;
BEGIN
  -- Check user has access to this property
  IF NOT public.can_manage_property(auth.uid(), p_property_id) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  new_token := encode(extensions.gen_random_bytes(16), 'hex');
  
  UPDATE public.properties 
  SET calendar_export_token = new_token
  WHERE id = p_property_id;
  
  RETURN new_token;
END;
$$;