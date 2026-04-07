import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useSEOImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadSEOImage = async (file: File, type: 'og' | 'favicon'): Promise<string | null> => {
    if (!file) return null;

    setUploading(true);
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (type === 'favicon') {
        allowedTypes.push('image/svg+xml', 'image/x-icon');
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `Please upload a ${type === 'favicon' ? 'PNG, JPG, WebP, SVG, or ICO' : 'JPEG, PNG, WebP, or GIF'} image.`,
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

      // Validate dimensions for optimal sizes
      if (type === 'og') {
        const img = new Image();
        const checkDimensions = new Promise<boolean>((resolve) => {
          img.onload = () => {
            const isOptimal = img.width === 1200 && img.height === 630;
            if (!isOptimal) {
              toast({
                title: 'Image dimensions notice',
                description: 'For best results, use 1200x630px for Open Graph images.',
                variant: 'default'
              });
            }
            resolve(true);
          };
          img.onerror = () => resolve(true);
          img.src = URL.createObjectURL(file);
        });
        await checkDimensions;
      }

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log(`📤 Uploading ${type} image:`, fileName);

      // Upload to the hero-images bucket (reusing existing bucket)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('hero-images')
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
        .from('hero-images')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log('🔗 Generated public URL:', publicUrl);

      toast({
        title: 'Upload successful',
        description: `${type === 'og' ? 'Open Graph' : 'Favicon'} image uploaded successfully.`,
      });

      return publicUrl;

    } catch (error) {
      console.error(`❌ Error uploading ${type} image:`, error);
      toast({
        title: 'Upload failed',
        description: `Failed to upload ${type} image. Please try again.`,
        variant: 'destructive'
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadSEOImage,
    uploading
  };
};