
-- Add status column to eugene_events table
ALTER TABLE eugene_events 
ADD COLUMN status text NOT NULL DEFAULT 'published';

-- Add constraint to ensure only valid status values
ALTER TABLE eugene_events 
ADD CONSTRAINT eugene_events_status_check 
CHECK (status IN ('draft', 'published'));

-- Update existing events to have published status
UPDATE eugene_events SET status = 'published' WHERE status IS NULL;
