
-- Add status column to lifestyle_gallery table
ALTER TABLE lifestyle_gallery 
ADD COLUMN status text NOT NULL DEFAULT 'published';

-- Add check constraint for valid status values
ALTER TABLE lifestyle_gallery 
ADD CONSTRAINT lifestyle_gallery_status_check 
CHECK (status IN ('draft', 'published'));
