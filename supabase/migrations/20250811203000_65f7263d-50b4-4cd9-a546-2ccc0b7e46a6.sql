-- Create storage bucket for guest avatar photos
INSERT INTO storage.buckets (id, name, public) VALUES ('guest-avatars', 'guest-avatars', true);

-- Create storage policies for guest avatar uploads
CREATE POLICY "Guest avatars are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'guest-avatars');

CREATE POLICY "Authenticated users can upload guest avatars" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'guest-avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update guest avatars" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'guest-avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete guest avatars" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'guest-avatars' AND auth.uid() IS NOT NULL);