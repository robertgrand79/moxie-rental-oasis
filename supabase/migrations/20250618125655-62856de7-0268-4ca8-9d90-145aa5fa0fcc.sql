
-- Add status field to points_of_interest table to support draft/published workflow
ALTER TABLE points_of_interest 
ADD COLUMN status text NOT NULL DEFAULT 'published';

-- Add a check constraint to ensure only valid status values
ALTER TABLE points_of_interest 
ADD CONSTRAINT points_of_interest_status_check 
CHECK (status IN ('draft', 'published'));
