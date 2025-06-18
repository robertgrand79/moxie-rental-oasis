
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useBlogImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadBlogImage = async (file: File): Promise<string | null> => {
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

      // Validate file size (10MB max for blog images)
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
      const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log('📤 Uploading blog image:', fileName);

      // Upload to the hero-images bucket (reusing existing bucket)
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

      return publicUrl;

    } catch (error) {
      console.error('❌ Error uploading blog image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload blog image. Please try again.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteBlogImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract filename from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];

      console.log('🗑️ Deleting blog image:', fileName);

      const { error } = await supabase.storage
        .from('hero-images')
        .remove([fileName]);

      if (error) {
        console.error('❌ Delete error:', error);
        return false;
      }

      console.log('✅ Image deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Error deleting blog image:', error);
      return false;
    }
  };

  return {
    uploadBlogImage,
    deleteBlogImage,
    uploading
  };
};
