
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAdvancedImageOptimization } from './useAdvancedImageOptimization';

interface MigrationProgress {
  total: number;
  processed: number;
  failed: number;
  current?: string;
}

export const useImageMigration = () => {
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState<MigrationProgress>({ total: 0, processed: 0, failed: 0 });
  const { generateResponsiveSources } = useAdvancedImageOptimization();

  const migrateExistingImages = async () => {
    setMigrating(true);
    setProgress({ total: 0, processed: 0, failed: 0 });

    try {
      // Get all blog posts with images
      const { data: blogPosts, error: blogError } = await supabase
        .from('blog_posts')
        .select('id, title, image_url')
        .not('image_url', 'is', null);

      if (blogError) throw blogError;

      // Get all properties with images
      const { data: properties, error: propError } = await supabase
        .from('properties')
        .select('id, title, image_url, images')
        .or('image_url.not.is.null,images.not.is.null');

      if (propError) throw propError;

      // Collect all unique image URLs
      const imageUrls = new Set<string>();
      
      blogPosts.forEach(post => {
        if (post.image_url) imageUrls.add(post.image_url);
      });

      properties.forEach(property => {
        if (property.image_url) imageUrls.add(property.image_url);
        if (property.images) {
          property.images.forEach((img: string) => imageUrls.add(img));
        }
      });

      const uniqueImages = Array.from(imageUrls);
      setProgress(prev => ({ ...prev, total: uniqueImages.length }));

      // Process each image
      for (let i = 0; i < uniqueImages.length; i++) {
        const imageUrl = uniqueImages[i];
        setProgress(prev => ({ ...prev, current: imageUrl }));

        try {
          // Check if already optimized
          const { data: existing } = await supabase
            .from('image_transformations')
            .select('id')
            .eq('original_url', imageUrl)
            .maybeSingle();

          if (!existing) {
            // Generate responsive versions
            const responsiveSources = generateResponsiveSources(imageUrl);
            
            // Create optimization records for each size
            const transformations = [];
            
            if (responsiveSources.thumbnail) {
              transformations.push({
                original_url: imageUrl,
                transformation_params: { width: 300, format: 'webp', quality: 85 },
                optimized_url: responsiveSources.thumbnail,
                format_original: 'unknown',
                format_optimized: 'webp'
              });
            }

            if (responsiveSources.medium) {
              transformations.push({
                original_url: imageUrl,
                transformation_params: { width: 768, format: 'webp', quality: 85 },
                optimized_url: responsiveSources.medium,
                format_original: 'unknown',
                format_optimized: 'webp'
              });
            }

            if (responsiveSources.large) {
              transformations.push({
                original_url: imageUrl,
                transformation_params: { width: 1200, format: 'webp', quality: 85 },
                optimized_url: responsiveSources.large,
                format_original: 'unknown',
                format_optimized: 'webp'
              });
            }

            // Insert transformation records
            if (transformations.length > 0) {
              const { error: insertError } = await supabase
                .from('image_transformations')
                .insert(transformations);

              if (insertError) {
                console.error('Error inserting transformation:', insertError);
                setProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
              }
            }
          }

          setProgress(prev => ({ ...prev, processed: prev.processed + 1 }));

        } catch (error) {
          console.error(`Error processing image ${imageUrl}:`, error);
          setProgress(prev => ({ ...prev, failed: prev.failed + 1, processed: prev.processed + 1 }));
        }

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast({
        title: 'Migration Complete',
        description: `Processed ${progress.processed} images. ${progress.failed} failed.`
      });

    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: 'Migration Failed',
        description: 'Failed to migrate existing images. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setMigrating(false);
      setProgress(prev => ({ ...prev, current: undefined }));
    }
  };

  const migrateImageSizes = async (imageUrl: string, updatedSources: any) => {
    try {
      // Update blog posts that use this image
      const { data: blogPosts } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('image_url', imageUrl);

      if (blogPosts) {
        // Could update blog posts to reference optimized versions
        // This would be a more advanced feature for phase 4
      }

      return true;
    } catch (error) {
      console.error('Error migrating image sizes:', error);
      return false;
    }
  };

  const cleanupUnusedOptimizations = async () => {
    try {
      // Get all optimized images
      const { data: transformations } = await supabase
        .from('image_transformations')
        .select('original_url, optimized_url');

      if (!transformations) return;

      // Check which original URLs are still in use
      const { data: blogPosts } = await supabase
        .from('blog_posts')
        .select('image_url')
        .not('image_url', 'is', null);

      const { data: properties } = await supabase
        .from('properties')
        .select('image_url, images')
        .or('image_url.not.is.null,images.not.is.null');

      const activeImageUrls = new Set<string>();
      
      blogPosts?.forEach(post => {
        if (post.image_url) activeImageUrls.add(post.image_url);
      });

      properties?.forEach(property => {
        if (property.image_url) activeImageUrls.add(property.image_url);
        if (property.images) {
          property.images.forEach((img: string) => activeImageUrls.add(img));
        }
      });

      // Find unused transformations
      const unusedTransformations = transformations.filter(
        t => !activeImageUrls.has(t.original_url)
      );

      if (unusedTransformations.length > 0) {
        console.log(`Found ${unusedTransformations.length} unused optimizations to clean up`);
        
        // Delete unused optimization records and files
        for (const transformation of unusedTransformations) {
          // Delete from storage if it's in our optimized-images bucket
          if (transformation.optimized_url.includes('optimized-images')) {
            const filename = transformation.optimized_url.split('/').pop();
            if (filename) {
              await supabase.storage
                .from('optimized-images')
                .remove([filename]);
            }
          }
        }

        // Delete transformation records
        const { error } = await supabase
          .from('image_transformations')
          .delete()
          .in('original_url', unusedTransformations.map(t => t.original_url));

        if (error) {
          console.error('Error cleaning up transformations:', error);
        } else {
          toast({
            title: 'Cleanup Complete',
            description: `Removed ${unusedTransformations.length} unused optimizations.`
          });
        }
      }

    } catch (error) {
      console.error('Error during cleanup:', error);
      toast({
        title: 'Cleanup Failed',
        description: 'Failed to clean up unused optimizations.',
        variant: 'destructive'
      });
    }
  };

  return {
    migrating,
    progress,
    migrateExistingImages,
    migrateImageSizes,
    cleanupUnusedOptimizations
  };
};
