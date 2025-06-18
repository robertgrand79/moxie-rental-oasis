
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import { useBlogImageUpload } from '@/hooks/useBlogImageUpload';

interface ImageUploaderProps {
  uploadedImage: string | null;
  onImageChange: (image: string | null) => void;
}

const ImageUploader = ({ uploadedImage, onImageChange }: ImageUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
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

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const uploadedUrl = await uploadBlogImage(file);
        if (uploadedUrl) {
          onImageChange(uploadedUrl);
        }
      }
    }
  }, [uploadBlogImage, onImageChange]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const uploadedUrl = await uploadBlogImage(file);
        if (uploadedUrl) {
          onImageChange(uploadedUrl);
        }
      }
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
            <p className="mt-2 text-sm text-gray-600">Uploading image...</p>
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
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
