-- Drop unused Turno-related columns from work_orders table
ALTER TABLE work_orders DROP COLUMN IF EXISTS task_id;
ALTER TABLE work_orders DROP COLUMN IF EXISTS turno_property_id;
ALTER TABLE work_orders DROP COLUMN IF EXISTS turno_last_modified;