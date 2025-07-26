-- Phase 2: Database Schema Enhancement for Turno Integration

-- Step 1: Enhance work_orders table with Turno integration fields
ALTER TABLE public.work_orders 
ADD COLUMN turno_problem_id text,
ADD COLUMN turno_property_id text,
ADD COLUMN source text NOT NULL DEFAULT 'manual',
ADD COLUMN turno_sync_status text;

-- Add check constraint for source values
ALTER TABLE public.work_orders 
ADD CONSTRAINT work_orders_source_check 
CHECK (source IN ('manual', 'turno'));

-- Add check constraint for turno_sync_status values
ALTER TABLE public.work_orders 
ADD CONSTRAINT work_orders_turno_sync_status_check 
CHECK (turno_sync_status IS NULL OR turno_sync_status IN ('pending', 'synced', 'failed', 'ignored'));

-- Step 2: Create turno_sync_log table for tracking sync operations
CREATE TABLE public.turno_sync_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sync_type text NOT NULL,
  turno_property_id text,
  sync_status text NOT NULL,
  sync_details jsonb DEFAULT '{}',
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add check constraint for sync_type values
ALTER TABLE public.turno_sync_log 
ADD CONSTRAINT turno_sync_log_sync_type_check 
CHECK (sync_type IN ('property_fetch', 'problems_fetch', 'work_order_creation', 'status_update'));

-- Add check constraint for sync_status values
ALTER TABLE public.turno_sync_log 
ADD CONSTRAINT turno_sync_log_sync_status_check 
CHECK (sync_status IN ('success', 'failed', 'partial'));

-- Step 3: Create turno_property_mapping table for property ID mapping
CREATE TABLE public.turno_property_mapping (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid REFERENCES public.properties(id) ON DELETE CASCADE,
  turno_property_id text NOT NULL,
  property_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate mappings
ALTER TABLE public.turno_property_mapping 
ADD CONSTRAINT turno_property_mapping_unique_turno_id 
UNIQUE (turno_property_id);

-- Step 4: Create indexes for performance
CREATE INDEX idx_work_orders_turno_problem_id ON public.work_orders(turno_problem_id);
CREATE INDEX idx_work_orders_turno_property_id ON public.work_orders(turno_property_id);
CREATE INDEX idx_work_orders_source ON public.work_orders(source);
CREATE INDEX idx_work_orders_turno_sync_status ON public.work_orders(turno_sync_status);
CREATE INDEX idx_turno_sync_log_sync_type ON public.turno_sync_log(sync_type);
CREATE INDEX idx_turno_sync_log_turno_property_id ON public.turno_sync_log(turno_property_id);
CREATE INDEX idx_turno_property_mapping_property_id ON public.turno_property_mapping(property_id);
CREATE INDEX idx_turno_property_mapping_turno_property_id ON public.turno_property_mapping(turno_property_id);

-- Step 5: Enable RLS on new tables
ALTER TABLE public.turno_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turno_property_mapping ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for turno_sync_log
CREATE POLICY "Authenticated users can view turno sync logs" 
ON public.turno_sync_log 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert turno sync logs" 
ON public.turno_sync_log 
FOR INSERT 
WITH CHECK (true);

-- Step 7: Create RLS policies for turno_property_mapping
CREATE POLICY "Authenticated users can view property mappings" 
ON public.turno_property_mapping 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage property mappings" 
ON public.turno_property_mapping 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Step 8: Add trigger for updated_at on turno_property_mapping
CREATE TRIGGER update_turno_property_mapping_updated_at
  BEFORE UPDATE ON public.turno_property_mapping
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();