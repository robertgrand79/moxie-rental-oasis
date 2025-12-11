-- Add public read access for place-images bucket
CREATE POLICY "Public can view place images"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-images');