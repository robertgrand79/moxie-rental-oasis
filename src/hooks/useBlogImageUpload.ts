
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useImageOptimization } from './useImageOptimization';

export const useBlogImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { optimizeImage, optimizing } = useImageOptimization();

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

      // Check original file size (before optimization)
      if (file.size > 50 * 1024 * 1024) { // 50MB limit for original
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 50MB.',
          variant: 'destructive'
        });
        return null;
      }

      console.log('🖼️ Starting image optimization...');
      
      // Optimize the image
      const optimizationResult = await optimizeImage(file, {
        maxWidth: 1200,
        quality: 0.85,
        generateSizes: false // For now, just optimize the main image
      });

      if (!optimizationResult) {
        // Fallback to original file if optimization fails
        console.log('⚠️ Using original file due to optimization failure');
      }

      const fileToUpload = optimizationResult?.optimizedFile || file;

      // Final size check after optimization
      if (fileToUpload.size > 10 * 1024 * 1024) {
        toast({
          title: 'Optimized file still too large',
          description: 'The optimized image is still larger than 10MB. Please try a smaller image.',
          variant: 'destructive'
        });
        return null;
      }

      // Create a unique filename
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log('📤 Uploading optimized blog image:', {
        fileName,
        originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        optimizedSize: `${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`
      });

      // Upload to the hero-images bucket (reusing existing bucket)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(fileName, fileToUpload, {
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

      // Show success message with optimization stats
      if (optimizationResult) {
        const compressionPercent = (((file.size - fileToUpload.size) / file.size) * 100).toFixed(1);
        toast({
          title: 'Image uploaded successfully',
          description: `Image optimized and compressed by ${compressionPercent}%`
        });
      }

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
    uploading: uploading || optimizing
  };
};
