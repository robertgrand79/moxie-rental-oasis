
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useImageOptimization } from './useImageOptimization';

interface UploadedImageSizes {
  thumbnail?: string;
  medium?: string;
  large?: string;
  original: string;
}

export const useBlogImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { optimizeImage, optimizing } = useImageOptimization();

  const uploadBlogImage = async (file: File): Promise<UploadedImageSizes | null> => {
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

      console.log('🖼️ Starting image optimization with multiple sizes...');
      
      // Optimize the image and generate multiple sizes
      const optimizationResult = await optimizeImage(file, {
        maxWidth: 1200,
        quality: 0.85,
        generateSizes: true
      });

      if (!optimizationResult) {
        console.log('⚠️ Using original file due to optimization failure');
        const originalUrl = await uploadSingleImage(file, 'original');
        return originalUrl ? { original: originalUrl } : null;
      }

      const { optimizedFile, sizes, compressionStats } = optimizationResult;

      // Upload all sizes
      const uploadPromises: Promise<{ size: string; url: string | null }>[] = [];
      
      // Upload main optimized image
      uploadPromises.push(
        uploadSingleImage(optimizedFile, 'large').then(url => ({ size: 'large', url }))
      );

      // Upload other sizes if available
      if (sizes) {
        if (sizes.thumbnail) {
          uploadPromises.push(
            uploadSingleImage(sizes.thumbnail, 'thumbnail').then(url => ({ size: 'thumbnail', url }))
          );
        }
        if (sizes.medium) {
          uploadPromises.push(
            uploadSingleImage(sizes.medium, 'medium').then(url => ({ size: 'medium', url }))
          );
        }
      }

      const uploadResults = await Promise.all(uploadPromises);
      
      // Build result object
      const result: UploadedImageSizes = { original: '' };
      
      for (const { size, url } of uploadResults) {
        if (url) {
          result[size as keyof UploadedImageSizes] = url;
          if (size === 'large') {
            result.original = url; // Use large as the main image
          }
        }
      }

      if (!result.original) {
        throw new Error('Failed to upload main image');
      }

      // Show success message with optimization stats
      if (compressionStats) {
        toast({
          title: 'Images uploaded successfully',
          description: `Optimized and compressed by ${compressionStats.compressionRatio.toFixed(1)}%. Generated ${uploadResults.filter(r => r.url).length} sizes.`
        });
      }

      console.log('✅ Multi-size upload complete:', result);
      return result;

    } catch (error) {
      console.error('❌ Error uploading blog images:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload blog images. Please try again.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadSingleImage = async (file: File, sizeLabel: string): Promise<string | null> => {
    try {
      // Create a unique filename with size label
      const fileExt = file.name.split('.').pop();
      const fileName = `blog-${sizeLabel}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log(`📤 Uploading ${sizeLabel} image:`, {
        fileName,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
      });

      // Upload to the hero-images bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(fileName, file, {
          cacheControl: '31536000',
          upsert: false
        });

      if (uploadError) {
        console.error(`❌ Upload error for ${sizeLabel}:`, uploadError);
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('hero-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;

    } catch (error) {
      console.error(`❌ Error uploading ${sizeLabel} image:`, error);
      return null;
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
