
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useHeroImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadHeroImage = async (file: File): Promise<string | null> => {
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

      // Validate file size (50MB max)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 50MB.',
          variant: 'destructive'
        });
        return null;
      }

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log('📤 Uploading hero image:', fileName);

      // Upload to the hero-images bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(fileName, file, {
          cacheControl: '3600',
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
        .from('hero-images')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log('🔗 Generated public URL:', publicUrl);

      // Test the uploaded image immediately
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          console.log('✅ Uploaded image verified successfully');
          toast({
            title: 'Upload successful',
            description: 'Hero image uploaded and verified successfully.',
          });
          resolve(publicUrl);
        };
        img.onerror = () => {
          console.error('❌ Uploaded image verification failed');
          toast({
            title: 'Upload warning',
            description: 'Image uploaded but verification failed. Please check the image.',
            variant: 'destructive'
          });
          resolve(publicUrl); // Still return the URL, let the user decide
        };
        img.src = publicUrl;
      });

    } catch (error) {
      console.error('❌ Error uploading hero image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload hero image. Please try again.',
        variant: 'destructive'
      });
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

      console.log('🗑️ Deleting hero image:', fileName);

      const { error } = await supabase.storage
        .from('hero-images')
        .remove([fileName]);

      if (error) {
        console.error('❌ Delete error:', error);
        toast({
          title: 'Delete failed',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }

      console.log('✅ Image deleted successfully');
      toast({
        title: 'Delete successful',
        description: 'Hero image deleted successfully.',
      });
      return true;
    } catch (error) {
      console.error('❌ Error deleting hero image:', error);
      return false;
    }
  };

  // Export functions with consistent naming
  return {
    uploadHeroImage,
    deleteHeroImage,
    uploading,
    // Also provide the old names for backward compatibility
    uploadImage: uploadHeroImage,
    deleteImage: deleteHeroImage
  };
};
