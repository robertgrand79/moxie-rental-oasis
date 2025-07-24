import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { convertToWebP, generateResponsiveSizes, createThumbnail, calculateOptimizationSavings } from '@/utils/imageOptimization';

interface UploadProgress {
  fileName: string;
  progress: number;
  optimizing: boolean;
  uploading: boolean;
}

export const useOptimizedPhotoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [optimizationStats, setOptimizationStats] = useState<{
    totalSaved: number;
    averageReduction: number;
  }>({ totalSaved: 0, averageReduction: 0 });
  const { toast } = useToast();

  const uploadOptimizedPhotos = async (files: File[], propertyId: string): Promise<string[]> => {
    setUploading(true);
    setUploadProgress(files.map(f => ({ 
      fileName: f.name, 
      progress: 0, 
      optimizing: true, 
      uploading: false 
    })));
    
    const uploadedUrls: string[] = [];
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    try {
      console.log('🖼️ Starting optimized upload of', files.length, 'files for property:', propertyId);
      
      // Process files sequentially to avoid overwhelming the browser
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const originalSize = file.size;
        totalOriginalSize += originalSize;
        
        try {
          // Update progress - start optimization
          setUploadProgress(prev => prev.map((p, idx) => 
            idx === i ? { ...p, optimizing: true, progress: 10 } : p
          ));

          // Step 1: Create optimized main image
          console.log(`🔄 Optimizing image ${i + 1}/${files.length}:`, file.name);
          const optimizedFile = await convertToWebP(file, { 
            quality: 0.85, 
            maxWidth: 1920, 
            maxHeight: 1080 
          });
          
          // Step 2: Create thumbnail
          const thumbnailFile = await createThumbnail(file, 400);
          
          totalOptimizedSize += optimizedFile.size + thumbnailFile.size;
          
          // Update progress - start upload
          setUploadProgress(prev => prev.map((p, idx) => 
            idx === i ? { ...p, optimizing: false, uploading: true, progress: 50 } : p
          ));

          // Step 3: Upload main image
          const mainFileExt = 'webp';
          const mainFileName = `${propertyId}/${Date.now()}-${i}-${Math.random().toString(36).substring(2)}.${mainFileExt}`;
          
          console.log('📤 Uploading optimized file:', mainFileName);
          const { data: mainData, error: mainError } = await supabase.storage
            .from('property-images')
            .upload(mainFileName, optimizedFile, {
              cacheControl: '31536000', // 1 year cache
              upsert: false
            });

          if (mainError) {
            throw new Error(`Failed to upload ${file.name}: ${mainError.message}`);
          }

          // Step 4: Upload thumbnail
          const thumbFileName = `${propertyId}/thumbs/${Date.now()}-${i}-thumb.webp`;
          
          await supabase.storage
            .from('property-images')
            .upload(thumbFileName, thumbnailFile, {
              cacheControl: '31536000',
              upsert: false
            });

          // Get public URLs
          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(mainData.path);

          uploadedUrls.push(publicUrl);
          
          // Update progress - complete
          setUploadProgress(prev => prev.map((p, idx) => 
            idx === i ? { ...p, uploading: false, progress: 100 } : p
          ));

          console.log('✅ Photo optimized and uploaded successfully:', publicUrl);
          
        } catch (error) {
          console.error(`❌ Failed to process file ${file.name}:`, error);
          setUploadProgress(prev => prev.map((p, idx) => 
            idx === i ? { ...p, optimizing: false, uploading: false, progress: 0 } : p
          ));
          // Continue with next file instead of failing completely
        }
      }

      // Calculate optimization statistics
      const stats = calculateOptimizationSavings(totalOriginalSize, totalOptimizedSize);
      setOptimizationStats({
        totalSaved: stats.savings,
        averageReduction: stats.percentage
      });

      if (uploadedUrls.length > 0) {
        toast({
          title: "Photos Optimized & Uploaded",
          description: `Successfully uploaded ${uploadedUrls.length} photo(s). Saved ${Math.round(stats.savings / 1024)}KB (${stats.percentage}% reduction).`,
        });
      }

      return uploadedUrls;
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "An error occurred while uploading photos.",
        variant: "destructive",
      });
      return [];
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress([]), 2000); // Clear progress after 2 seconds
    }
  };

  const deletePhoto = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract the file path from the URL
      const urlParts = imageUrl.split('/property-images/');
      if (urlParts.length < 2) return false;
      
      const filePath = urlParts[1];
      const thumbPath = `thumbs/${filePath.split('/').pop()?.replace(/\.[^/.]+$/, '-thumb.webp')}`;

      // Delete both main image and thumbnail
      await Promise.all([
        supabase.storage.from('property-images').remove([filePath]),
        supabase.storage.from('property-images').remove([thumbPath])
      ]);

      return true;
    } catch (error) {
      console.error('❌ Delete error:', error);
      return false;
    }
  };

  return {
    uploadOptimizedPhotos,
    deletePhoto,
    uploading,
    uploadProgress,
    optimizationStats
  };
};