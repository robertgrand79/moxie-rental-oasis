
-- Create hero-images storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'hero-images',
  'hero-images', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for hero-images bucket
CREATE POLICY "Allow public read access to hero images" ON storage.objects
FOR SELECT USING (bucket_id = 'hero-images');

CREATE POLICY "Allow authenticated users to upload hero images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'hero-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to update hero images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'hero-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete hero images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'hero-images' 
  AND auth.role() = 'authenticated'
);
