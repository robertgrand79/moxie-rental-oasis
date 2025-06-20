
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WorkOrderFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document';
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export const useWorkOrderFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  const uploadFiles = async (files: File[], workOrderId?: string): Promise<WorkOrderFile[]> => {
    if (files.length === 0) return [];

    setUploading(true);
    const uploadedFiles: WorkOrderFile[] = [];

    try {
      for (const file of files) {
        const fileId = crypto.randomUUID();
        const timestamp = new Date().toISOString();
        const fileName = `${workOrderId || 'temp'}_${timestamp}_${file.name}`;
        const filePath = workOrderId ? `${workOrderId}/${fileName}` : `temp/${fileName}`;

        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        const { data, error } = await supabase.storage
          .from('work-order-files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Error uploading file:', error);
          toast({
            title: 'Upload Error',
            description: `Failed to upload ${file.name}`,
            variant: 'destructive',
          });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('work-order-files')
          .getPublicUrl(data.path);

        const fileType = file.type.startsWith('image/') ? 'image' : 'document';

        uploadedFiles.push({
          id: fileId,
          name: file.name,
          url: publicUrl,
          type: fileType,
          mimeType: file.type,
          size: file.size,
          uploadedAt: timestamp,
        });

        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      }

      toast({
        title: 'Success',
        description: `${uploadedFiles.length} file(s) uploaded successfully`,
      });

    } catch (error) {
      console.error('Error during file upload:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress({});
    }

    return uploadedFiles;
  };

  const deleteFile = async (fileUrl: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const workOrderId = urlParts[urlParts.length - 2];
      const filePath = `${workOrderId}/${fileName}`;

      const { error } = await supabase.storage
        .from('work-order-files')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  };

  const moveTemporaryFiles = async (tempFiles: WorkOrderFile[], workOrderId: string): Promise<WorkOrderFile[]> => {
    const movedFiles: WorkOrderFile[] = [];

    for (const file of tempFiles) {
      try {
        // Extract temp file path
        const urlParts = file.url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const tempPath = `temp/${fileName}`;
        const newPath = `${workOrderId}/${fileName}`;

        // Move file from temp to work order folder
        const { data, error } = await supabase.storage
          .from('work-order-files')
          .move(tempPath, newPath);

        if (error) {
          console.error('Error moving file:', error);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('work-order-files')
          .getPublicUrl(newPath);

        movedFiles.push({
          ...file,
          url: publicUrl,
        });

      } catch (error) {
        console.error('Error moving file:', error);
      }
    }

    return movedFiles;
  };

  return {
    uploading,
    uploadProgress,
    uploadFiles,
    deleteFile,
    moveTemporaryFiles,
  };
};
