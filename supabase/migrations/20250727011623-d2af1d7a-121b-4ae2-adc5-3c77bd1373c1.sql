-- Remove Turno integration columns from work_orders table
ALTER TABLE public.work_orders 
DROP COLUMN IF EXISTS turno_problem_id,
DROP COLUMN IF EXISTS turno_sync_status,
DROP COLUMN IF EXISTS sync_conflict_reason,
DROP COLUMN IF EXISTS turno_status_override,
DROP COLUMN IF EXISTS last_turno_sync_at;