
-- Add project_id field to work_orders table to enable direct project linking
ALTER TABLE work_orders ADD COLUMN project_id uuid REFERENCES property_projects(id);

-- Create index for better query performance
CREATE INDEX idx_work_orders_project_id ON work_orders(project_id);
