
import { useState } from 'react';
import { validateFileUpload } from '@/utils/security';
import { auditService } from '@/services/auditService';
import { toast } from '@/hooks/use-toast';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const useSecureFileUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, bucket: string, path: string): Promise<UploadResult> => {
    setUploading(true);

    try {
      // Validate file
      const validation = validateFileUpload(file);
      if (!validation.isValid) {
        await auditService.logSecurityEvent({
          action: 'file_upload_rejected',
          success: false,
          details: { reason: validation.error, fileName: file.name, fileSize: file.size }
        });
        
        toast({
          title: 'Upload Failed',
          description: validation.error,
          variant: 'destructive'
        });
        
        return { success: false, error: validation.error };
      }

      // Log successful upload attempt
      await auditService.logSecurityEvent({
        action: 'file_upload_started',
        success: true,
        details: { fileName: file.name, fileSize: file.size, bucket, path }
      });

      // Here you would implement the actual upload logic
      // This is a placeholder - replace with your actual upload implementation
      const uploadResult = { success: true, url: `${bucket}/${path}` };

      if (uploadResult.success) {
        await auditService.logSecurityEvent({
          action: 'file_upload_completed',
          success: true,
          details: { fileName: file.name, url: uploadResult.url }
        });
      }

      return uploadResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      await auditService.logSecurityEvent({
        action: 'file_upload_failed',
        success: false,
        details: { error: errorMessage, fileName: file.name }
      });

      toast({
        title: 'Upload Error',
        description: errorMessage,
        variant: 'destructive'
      });

      return { success: false, error: errorMessage };
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading };
};
