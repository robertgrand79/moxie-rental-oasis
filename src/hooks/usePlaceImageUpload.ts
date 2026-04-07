import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const usePlaceImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadPlaceImage = async (file: File): Promise<string | null> => {
    if (!file) return null;

    setUploading(true);
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a JPEG, PNG, WebP, or GIF image.',
          variant: 'destructive'
        });
        return null;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 10MB.',
          variant: 'destructive'
        });
        return null;
      }

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `place-image-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log('📤 Uploading place image:', fileName);

      // Upload to the place-images bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('place-images')
        .upload(fileName, file, {
          cacheControl: '31536000',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        toast({
          title: 'Upload failed',
          description: uploadError.message,
          variant: 'destructive'
        });
        throw uploadError;
      }

      console.log('✅ Upload successful:', uploadData);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('place-images')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log('🔗 Generated public URL:', publicUrl);

      toast({
        title: 'Upload successful',
        description: 'Place image uploaded successfully.',
      });

      return publicUrl;

    } catch (error) {
      console.error('❌ Error uploading place image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload place image. Please try again.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadPlaceImage,
    uploading
  };
};
