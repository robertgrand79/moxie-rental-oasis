-- Add latitude and longitude columns to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric;

-- Add an index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_properties_coordinates 
ON public.properties (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add a comment to document the columns
COMMENT ON COLUMN public.properties.latitude IS 'Latitude coordinate for property location';
COMMENT ON COLUMN public.properties.longitude IS 'Longitude coordinate for property location';