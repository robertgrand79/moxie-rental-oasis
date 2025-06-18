
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useBlogImageUpload } from '@/hooks/useBlogImageUpload';

interface ImageUploaderProps {
  uploadedImage: string | null;
  onImageChange: (image: string | null) => void;
}

const ImageUploader = ({ uploadedImage, onImageChange }: ImageUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { uploadBlogImage, deleteBlogImage, uploading } = useBlogImageUpload();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    console.log('📁 Selected file:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type
    });

    setSelectedFile(file);
    
    const uploadedUrl = await uploadBlogImage(file);
    if (uploadedUrl) {
      onImageChange(uploadedUrl);
      setSelectedFile(null);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const removeImage = async () => {
    if (uploadedImage) {
      // Only try to delete if it's a Supabase URL
      if (uploadedImage.includes('supabase')) {
        await deleteBlogImage(uploadedImage);
      }
    }
    onImageChange(null);
    setSelectedFile(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <Label>Featured Image</Label>
      <div
        className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${uploadedImage ? 'border-green-500' : ''} ${
          uploading ? 'opacity-50 pointer-events-none' : ''
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-2 text-sm text-gray-600">
              {selectedFile ? 'Optimizing and uploading...' : 'Uploading image...'}
            </p>
            {selectedFile && (
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <ImageIcon className="h-3 w-3" />
                  <span>{selectedFile.name}</span>
                </div>
                <div>Original size: {formatFileSize(selectedFile.size)}</div>
                <div className="text-blue-600">Compressing for faster loading...</div>
              </div>
            )}
          </div>
        ) : uploadedImage ? (
          <div className="relative">
            <img
              src={uploadedImage}
              alt="Preview"
              className="w-full h-40 object-cover rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeImage}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Optimized for web
            </div>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop an image here, or
            </p>
            <label className="mt-2 cursor-pointer">
              <span className="text-blue-600 hover:text-blue-500">browse files</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
            <p className="mt-2 text-xs text-gray-500">
              Images will be automatically optimized for faster loading
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
