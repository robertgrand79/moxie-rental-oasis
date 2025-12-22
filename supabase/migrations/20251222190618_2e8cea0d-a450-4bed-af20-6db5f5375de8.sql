-- Add new columns to assistant_settings for custom avatar support
ALTER TABLE assistant_settings
ADD COLUMN IF NOT EXISTS avatar_background_color TEXT DEFAULT '#1a365d',
ADD COLUMN IF NOT EXISTS avatar_background_color_end TEXT DEFAULT '#2c5282',
ADD COLUMN IF NOT EXISTS custom_avatar_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS use_custom_avatar BOOLEAN DEFAULT FALSE;

-- Create storage bucket for assistant avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('assistant-avatars', 'assistant-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Organization admins can upload assistant avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assistant-avatars' AND
  auth.uid() IS NOT NULL
);

-- Allow public read access to avatars
CREATE POLICY "Anyone can view assistant avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'assistant-avatars');

-- Allow authenticated users to update their uploads
CREATE POLICY "Organization admins can update assistant avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'assistant-avatars' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to delete their uploads
CREATE POLICY "Organization admins can delete assistant avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'assistant-avatars' AND auth.uid() IS NOT NULL);