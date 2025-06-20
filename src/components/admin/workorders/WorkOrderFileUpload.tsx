
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { X, Upload, FileText, Image, Download } from 'lucide-react';
import { useWorkOrderFileUpload, WorkOrderFile } from '@/hooks/useWorkOrderFileUpload';
import { useToast } from '@/hooks/use-toast';

interface WorkOrderFileUploadProps {
  files: WorkOrderFile[];
  onFilesChange: (files: WorkOrderFile[]) => void;
  workOrderId?: string;
  label?: string;
  maxFiles?: number;
  acceptedTypes?: string[];
}

const WorkOrderFileUpload = ({
  files,
  onFilesChange,
  workOrderId,
  label = "Attachments",
  maxFiles = 10,
  acceptedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
}: WorkOrderFileUploadProps) => {
  const { uploading, uploadProgress, uploadFiles, deleteFile } = useWorkOrderFileUpload();
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    console.log('Files dropped:', acceptedFiles);
    
    if (files.length + acceptedFiles.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum ${maxFiles} files allowed`,
        variant: 'destructive',
      });
      return;
    }

    try {
      const uploadedFiles = await uploadFiles(acceptedFiles, workOrderId);
      onFilesChange([...files, ...uploadedFiles]);
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  }, [files, maxFiles, workOrderId, uploadFiles, onFilesChange, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const handleRemoveFile = async (fileToRemove: WorkOrderFile) => {
    try {
      if (workOrderId) {
        await deleteFile(fileToRemove.url);
      }
      onFilesChange(files.filter(file => file.id !== fileToRemove.id));
      toast({
        title: 'Success',
        description: 'File removed successfully',
      });
    } catch (error) {
      console.error('Error removing file:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove file',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: WorkOrderFile) => {
    if (file.type === 'image') {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">{label}</Label>
      
      {/* Dropzone */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragActive || dragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
      }`}>
        <CardContent className="p-6">
          <div {...getRootProps()} className="cursor-pointer text-center">
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="font-medium">Click to upload</span> or drag and drop
              </div>
              <div className="text-xs text-gray-500">
                Images, PDFs, and documents up to 50MB
              </div>
              <div className="text-xs text-gray-400">
                {files.length}/{maxFiles} files
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploading && Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Attached Files ({files.length})
          </div>
          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getFileIcon(file)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {file.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(file)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {file.type === 'image' && (
                  <div className="mt-2">
                    <img
                      src={file.url}
                      alt={file.name}
                      className="max-w-full h-32 object-contain rounded-md border"
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderFileUpload;
