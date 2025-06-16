
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useHeroImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadHeroImage = async (file: File): Promise<string | null> => {
    if (!file) return null;

    setUploading(true);
    try {
      // Create a unique filename with timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      console.log('Uploading hero image:', fileName);

      // Upload the file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('hero-images')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', urlData.publicUrl);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading hero image:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteHeroImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract filename from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];

      console.log('Deleting hero image:', fileName);

      const { error } = await supabase.storage
        .from('hero-images')
        .remove([fileName]);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Image deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting hero image:', error);
      return false;
    }
  };

  return {
    uploadHeroImage,
    deleteHeroImage,
    uploading
  };
};
