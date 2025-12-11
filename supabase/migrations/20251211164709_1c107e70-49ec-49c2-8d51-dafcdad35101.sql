-- Create storage bucket for place images
INSERT INTO storage.buckets (id, name, public)
VALUES ('place-images', 'place-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Place images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'place-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload place images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'place-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update place images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'place-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete place images"
ON storage.objects FOR DELETE
USING (bucket_id = 'place-images' AND auth.role() = 'authenticated');