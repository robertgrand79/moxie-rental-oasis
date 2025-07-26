-- Add sync-specific columns to work_orders table for two-way Turno synchronization
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS last_turno_sync_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS turno_status_override boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sync_conflict_reason text,
ADD COLUMN IF NOT EXISTS turno_last_modified timestamp with time zone;

-- Add source column to track the origin of work orders
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual' CHECK (source IN ('manual', 'turno'));

-- Create turno_sync_log table for detailed sync tracking
CREATE TABLE IF NOT EXISTS turno_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid REFERENCES work_orders(id) ON DELETE CASCADE,
  sync_direction text NOT NULL CHECK (sync_direction IN ('to_turno', 'from_turno', 'bidirectional')),
  sync_status text NOT NULL CHECK (sync_status IN ('success', 'failed', 'partial')),
  status_before text,
  status_after text,
  conflict_resolution text,
  error_message text,
  sync_details jsonb DEFAULT '{}',
  turno_api_response jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on turno_sync_log
ALTER TABLE turno_sync_log ENABLE ROW LEVEL SECURITY;

-- Create policy for turno_sync_log
CREATE POLICY "Users can view their work order sync logs" ON turno_sync_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM work_orders wo 
    WHERE wo.id = turno_sync_log.work_order_id 
    AND wo.created_by = auth.uid()
  )
);

CREATE POLICY "Admins can manage all sync logs" ON turno_sync_log
FOR ALL USING (is_admin());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_orders_turno_sync ON work_orders(turno_problem_id, last_turno_sync_at);
CREATE INDEX IF NOT EXISTS idx_work_orders_source ON work_orders(source);
CREATE INDEX IF NOT EXISTS idx_turno_sync_log_work_order ON turno_sync_log(work_order_id);
CREATE INDEX IF NOT EXISTS idx_turno_sync_log_created_at ON turno_sync_log(created_at DESC);