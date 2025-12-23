-- Create the property-documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-documents', 'property-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-documents');

-- Allow authenticated users to read documents
CREATE POLICY "Authenticated users can read documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'property-documents');

-- Allow authenticated users to delete their documents
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-documents');

-- Allow public read access for documents
CREATE POLICY "Public can read documents"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'property-documents');