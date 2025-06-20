
-- Create storage bucket for work order files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'work-order-files',
  'work-order-files',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
);

-- Create storage policies for work order files
CREATE POLICY "Anyone can view work order files"
ON storage.objects FOR SELECT
USING (bucket_id = 'work-order-files');

CREATE POLICY "Authenticated users can upload work order files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'work-order-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own work order files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'work-order-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete work order files"
ON storage.objects FOR DELETE
USING (bucket_id = 'work-order-files' AND auth.role() = 'authenticated');
