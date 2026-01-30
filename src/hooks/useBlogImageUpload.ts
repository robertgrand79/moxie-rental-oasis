
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

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second initial delay

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isRetryableError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('failed to fetch') ||
      message.includes('connection')
    );
  }
  return false;
};

export const useBlogImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { optimizeImage, optimizing } = useImageOptimization();

  const uploadBlogImage = async (file: File): Promise<UploadedImageSizes | null> => {
    if (!file) return null;

    setUploading(true);
    try {
      // Check if user is authenticated before attempting upload
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('❌ Authentication check failed:', sessionError);
        toast({
          title: 'Authentication required',
          description: 'Please log in again to upload images.',
          variant: 'destructive'
        });
        return null;
      }

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
        const originalUrl = await uploadSingleImageWithRetry(file, 'original');
        return originalUrl ? { original: originalUrl } : null;
      }

      const { optimizedFile, sizes, compressionStats } = optimizationResult;

      // Upload all sizes
      const uploadPromises: Promise<{ size: string; url: string | null }>[] = [];
      
      // Upload main optimized image
      uploadPromises.push(
        uploadSingleImageWithRetry(optimizedFile, 'large').then(url => ({ size: 'large', url }))
      );

      // Upload other sizes if available
      if (sizes) {
        if (sizes.thumbnail) {
          uploadPromises.push(
            uploadSingleImageWithRetry(sizes.thumbnail, 'thumbnail').then(url => ({ size: 'thumbnail', url }))
          );
        }
        if (sizes.medium) {
          uploadPromises.push(
            uploadSingleImageWithRetry(sizes.medium, 'medium').then(url => ({ size: 'medium', url }))
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
      
      // Provide specific error messages based on error type
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('permission') || errorMessage.includes('policy') || errorMessage.includes('unauthorized')) {
        toast({
          title: 'Permission denied',
          description: 'Your session may have expired. Please refresh the page and log in again.',
          variant: 'destructive'
        });
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
        toast({
          title: 'Network error',
          description: 'Upload failed after multiple retries. Please check your internet connection and try again.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload blog images. Please try again.',
          variant: 'destructive'
        });
      }
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadSingleImageWithRetry = async (
    file: File, 
    sizeLabel: string, 
    attempt: number = 1
  ): Promise<string | null> => {
    try {
      return await uploadSingleImage(file, sizeLabel);
    } catch (error) {
      console.error(`❌ Upload attempt ${attempt} failed for ${sizeLabel}:`, error);
      
      if (attempt < MAX_RETRIES && isRetryableError(error)) {
        const waitTime = RETRY_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`⏳ Retrying ${sizeLabel} upload in ${waitTime}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await delay(waitTime);
        return uploadSingleImageWithRetry(file, sizeLabel, attempt + 1);
      }
      
      throw error;
    }
  };

  const uploadSingleImage = async (file: File, sizeLabel: string): Promise<string | null> => {
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
        cacheControl: '3600',
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
