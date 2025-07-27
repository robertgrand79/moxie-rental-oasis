-- Create sync log table to track all sync operations
CREATE TABLE public.turno_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type TEXT NOT NULL, -- 'problems', 'properties', 'status_update', 'full_sync'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'error'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  items_processed INTEGER DEFAULT 0,
  items_created INTEGER DEFAULT 0,
  items_updated INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  error_message TEXT,
  error_details JSONB,
  api_response_sample JSONB, -- Store sample of API response for debugging
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.turno_sync_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view sync logs" 
ON public.turno_sync_log 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert sync logs" 
ON public.turno_sync_log 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update sync logs" 
ON public.turno_sync_log 
FOR UPDATE 
USING (true);

-- Add index for performance
CREATE INDEX idx_turno_sync_log_type_status ON public.turno_sync_log(sync_type, status);
CREATE INDEX idx_turno_sync_log_started_at ON public.turno_sync_log(started_at DESC);