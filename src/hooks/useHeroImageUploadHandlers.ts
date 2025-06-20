
import { useState, useCallback } from 'react';
import { useHeroImageUpload } from '@/hooks/useHeroImageUpload';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { toast } from '@/hooks/use-toast';

export const useHeroImageUploadHandlers = (onImageChange: (imageUrl: string | null) => void) => {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadHeroImage, deleteHeroImage } = useHeroImageUpload();
  const { saveSetting } = useSimplifiedSiteSettings();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPEG, PNG, WebP, or GIF).',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    console.log('[Hero Image] Starting upload process for:', file.name);

    try {
      // Upload the image to storage
      const uploadedUrl = await uploadHeroImage(file);
      
      if (uploadedUrl) {
        console.log('[Hero Image] Upload successful, saving to database:', uploadedUrl);
        
        // Save the URL to the database immediately
        const saveSuccess = await saveSetting('heroBackgroundImage', uploadedUrl);
        
        if (saveSuccess) {
          console.log('[Hero Image] Database save successful');
          // Notify parent component of the change
          onImageChange(uploadedUrl);
          
          toast({
            title: 'Hero image updated',
            description: 'Your hero background image has been successfully updated.',
          });
        } else {
          console.error('[Hero Image] Database save failed');
          toast({
            title: 'Save error',
            description: 'Image uploaded but failed to save to database. Please try again.',
            variant: 'destructive'
          });
        }
      } else {
        console.error('[Hero Image] Upload failed');
      }
    } catch (error) {
      console.error('[Hero Image] Upload process failed:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload hero image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileSelect(file);
    }
    // Reset the input
    e.target.value = '';
  };

  const removeImage = async (currentImageUrl: string | null) => {
    console.log('[Hero Image] Removing hero image');
    setIsUploading(true);
    
    try {
      // If there's a current image, try to delete it from storage
      if (currentImageUrl) {
        await deleteHeroImage(currentImageUrl);
      }
      
      // Save empty string to database
      const saveSuccess = await saveSetting('heroBackgroundImage', '');
      
      if (saveSuccess) {
        console.log('[Hero Image] Image removal successful');
        onImageChange(null);
        
        toast({
          title: 'Hero image removed',
          description: 'Your hero background image has been removed.',
        });
      } else {
        toast({
          title: 'Remove error',
          description: 'Failed to remove hero image. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('[Hero Image] Remove process failed:', error);
      toast({
        title: 'Remove failed',
        description: 'Failed to remove hero image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    dragActive,
    isUploading,
    handleDrag,
    handleDrop,
    handleFileChange,
    removeImage
  };
};
