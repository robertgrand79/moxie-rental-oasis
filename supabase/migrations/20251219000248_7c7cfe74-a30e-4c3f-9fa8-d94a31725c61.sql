-- Add POI-specific fields to places table
ALTER TABLE public.places 
ADD COLUMN IF NOT EXISTS distance_from_properties numeric,
ADD COLUMN IF NOT EXISTS walking_time integer,
ADD COLUMN IF NOT EXISTS driving_time integer,
ADD COLUMN IF NOT EXISTS show_on_map boolean DEFAULT true;

-- Create index for map queries
CREATE INDEX IF NOT EXISTS idx_places_show_on_map ON public.places(show_on_map) WHERE show_on_map = true;

-- Migrate data from points_of_interest to places
-- First, update existing places with POI data where names match
UPDATE public.places p
SET 
  distance_from_properties = poi.distance_from_properties,
  walking_time = poi.walking_time,
  driving_time = poi.driving_time,
  show_on_map = COALESCE(poi.is_featured, true)
FROM public.points_of_interest poi
WHERE LOWER(TRIM(p.name)) = LOWER(TRIM(poi.name))
  AND p.organization_id = poi.organization_id;

-- Insert POIs that don't exist in places
INSERT INTO public.places (
  name,
  description,
  category,
  address,
  latitude,
  longitude,
  phone,
  website_url,
  is_active,
  is_featured,
  organization_id,
  distance_from_properties,
  walking_time,
  driving_time,
  show_on_map,
  created_by
)
SELECT 
  poi.name,
  poi.description,
  poi.category,
  poi.address,
  poi.latitude,
  poi.longitude,
  poi.phone,
  poi.website_url,
  poi.is_active,
  poi.is_featured,
  poi.organization_id,
  poi.distance_from_properties,
  poi.walking_time,
  poi.driving_time,
  true,
  poi.created_by
FROM public.points_of_interest poi
WHERE NOT EXISTS (
  SELECT 1 FROM public.places p 
  WHERE LOWER(TRIM(p.name)) = LOWER(TRIM(poi.name))
    AND p.organization_id = poi.organization_id
);

-- Drop the points_of_interest table
DROP TABLE IF EXISTS public.points_of_interest CASCADE;