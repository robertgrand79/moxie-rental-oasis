-- Clean up featured_photos field by removing blob URLs
UPDATE properties 
SET featured_photos = ARRAY(
  SELECT elem FROM unnest(featured_photos) AS elem 
  WHERE elem NOT LIKE 'blob:%'
)
WHERE featured_photos IS NOT NULL;