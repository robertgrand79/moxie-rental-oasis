-- Add hospitable_booking_url back to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS hospitable_booking_url TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN properties.hospitable_booking_url IS 'External Hospitable direct booking URL (legacy field preserved for backwards compatibility)';

-- Drop existing foreign key constraint on work_orders if it exists
ALTER TABLE work_orders 
DROP CONSTRAINT IF EXISTS work_orders_property_id_fkey;

-- Re-add with CASCADE delete behavior
ALTER TABLE work_orders
ADD CONSTRAINT work_orders_property_id_fkey 
FOREIGN KEY (property_id) 
REFERENCES properties(id) 
ON DELETE CASCADE;

-- Do the same for other related tables to ensure clean deletion
ALTER TABLE availability_blocks 
DROP CONSTRAINT IF EXISTS availability_blocks_property_id_fkey;

ALTER TABLE availability_blocks
ADD CONSTRAINT availability_blocks_property_id_fkey 
FOREIGN KEY (property_id) 
REFERENCES properties(id) 
ON DELETE CASCADE;

ALTER TABLE dynamic_pricing 
DROP CONSTRAINT IF EXISTS dynamic_pricing_property_id_fkey;

ALTER TABLE dynamic_pricing
ADD CONSTRAINT dynamic_pricing_property_id_fkey 
FOREIGN KEY (property_id) 
REFERENCES properties(id) 
ON DELETE CASCADE;

ALTER TABLE external_calendars 
DROP CONSTRAINT IF EXISTS external_calendars_property_id_fkey;

ALTER TABLE external_calendars
ADD CONSTRAINT external_calendars_property_id_fkey 
FOREIGN KEY (property_id) 
REFERENCES properties(id) 
ON DELETE CASCADE;

ALTER TABLE device_configurations 
DROP CONSTRAINT IF EXISTS device_configurations_property_id_fkey;

ALTER TABLE device_configurations
ADD CONSTRAINT device_configurations_property_id_fkey 
FOREIGN KEY (property_id) 
REFERENCES properties(id) 
ON DELETE CASCADE;

ALTER TABLE device_automations 
DROP CONSTRAINT IF EXISTS device_automations_property_id_fkey;

ALTER TABLE device_automations
ADD CONSTRAINT device_automations_property_id_fkey 
FOREIGN KEY (property_id) 
REFERENCES properties(id) 
ON DELETE CASCADE;