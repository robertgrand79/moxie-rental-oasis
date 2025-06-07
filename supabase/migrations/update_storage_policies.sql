
-- Update storage policy to allow anonymous users to upload images
DROP POLICY IF EXISTS "Allow authenticated users to upload property images" ON storage.objects;

CREATE POLICY "Allow anonymous users to upload property images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-images'
);

-- Update storage policy to allow anonymous users to delete images  
DROP POLICY IF EXISTS "Allow authenticated users to delete property images" ON storage.objects;

CREATE POLICY "Allow anonymous users to delete property images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'property-images'
);
