-- Add foreign key constraint from property_reservations to properties
ALTER TABLE property_reservations 
ADD CONSTRAINT property_reservations_property_id_fkey 
FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;