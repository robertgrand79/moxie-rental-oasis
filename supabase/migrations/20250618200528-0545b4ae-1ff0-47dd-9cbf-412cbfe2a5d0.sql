
-- Drop property management tables and related constraints
-- Note: We're keeping the base 'properties' table for basic property listings

-- Drop property_tasks table and related
DROP TABLE IF EXISTS task_assignments CASCADE;
DROP TABLE IF EXISTS property_tasks CASCADE;

-- Drop property_projects table
DROP TABLE IF EXISTS property_projects CASCADE;

-- Drop custom_task_types table
DROP TABLE IF EXISTS custom_task_types CASCADE;

-- Drop maintenance_schedules table (part of property management)
DROP TABLE IF EXISTS maintenance_schedules CASCADE;

-- Drop task_comments table
DROP TABLE IF EXISTS task_comments CASCADE;

-- Remove project_id column from work_orders (we'll keep work_orders as standalone)
ALTER TABLE work_orders DROP COLUMN IF EXISTS project_id;

-- Keep the core properties table, work_orders, and contractors tables
-- These will function independently without the complex property management system
