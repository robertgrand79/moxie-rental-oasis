
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePhotoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadPhotos = async (files: File[], propertyId: string): Promise<string[]> => {
    setUploading(true);
    setUploadProgress(0);
    const uploadedUrls: string[] = [];

    try {
      console.log('Starting parallel upload of', files.length, 'files for property:', propertyId);
      
      // Upload files in parallel for better performance
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${propertyId}/${Date.now()}-${index}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        console.log('Uploading file:', fileName);

        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error for file:', file.name, error);
          throw new Error(`Failed to upload ${file.name}: ${error.message}`);
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(data.path);

        console.log('Photo uploaded successfully:', publicUrl);
        return publicUrl;
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      uploadedUrls.push(...results);

      setUploadProgress(100);
      
      toast({
        title: "Photos Uploaded",
        description: `Successfully uploaded ${uploadedUrls.length} photo(s).`,
      });

      return uploadedUrls;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "An error occurred while uploading photos.",
        variant: "destructive",
      });
      return [];
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deletePhoto = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract the file path from the URL
      const urlParts = imageUrl.split('/property-images/');
      if (urlParts.length < 2) return false;
      
      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from('property-images')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  };

  return {
    uploadPhotos,
    deletePhoto,
    uploading,
    uploadProgress
  };
};
