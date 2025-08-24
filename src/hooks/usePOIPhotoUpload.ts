import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePOIPhotoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const uploadPhoto = async (file: File, poiId: string): Promise<string | null> => {
    setUploading(true);
    setUploadProgress(prev => ({ ...prev, [poiId]: 0 }));

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${poiId}/main.${fileExt}`;
      const filePath = fileName;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      setUploadProgress(prev => ({ ...prev, [poiId]: 100 }));
      
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[poiId];
          return newProgress;
        });
      }, 1000);
    }
  };

  const deletePhoto = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const folder = pathParts[pathParts.length - 2];
      const filePath = `${folder}/${fileName}`;

      const { error } = await supabase.storage
        .from('property-images')
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    uploadPhoto,
    deletePhoto,
    uploading,
    uploadProgress
  };
};