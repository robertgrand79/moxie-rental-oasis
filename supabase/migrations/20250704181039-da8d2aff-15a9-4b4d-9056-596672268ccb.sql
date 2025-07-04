-- Clean up featured_photos field by removing blob URLs
UPDATE properties 
SET featured_photos = ARRAY(
  SELECT unnest(featured_photos) AS url 
  WHERE url NOT LIKE 'blob:%'
)
WHERE featured_photos IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM unnest(featured_photos) AS url 
    WHERE url LIKE 'blob:%'
  );