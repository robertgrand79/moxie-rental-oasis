
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { useHeroImageUpload } from '@/hooks/useHeroImageUpload';
import { toast } from '@/hooks/use-toast';

interface HeroImageUploaderProps {
  currentImageUrl: string | null;
  onImageChange: (imageUrl: string | null) => void;
}

const HeroImageUploader = ({ currentImageUrl, onImageChange }: HeroImageUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { uploadHeroImage, deleteHeroImage, uploading } = useHeroImageUpload();

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
        const uploadedUrl = await uploadHeroImage(file);
        if (uploadedUrl) {
          onImageChange(uploadedUrl);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 2000);
          toast({
            title: 'Success',
            description: 'Hero image uploaded and saved successfully!',
          });
        }
      }
    }
  }, [uploadHeroImage, onImageChange]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        const uploadedUrl = await uploadHeroImage(file);
        if (uploadedUrl) {
          onImageChange(uploadedUrl);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 2000);
          toast({
            title: 'Success',
            description: 'Hero image uploaded and saved successfully!',
          });
        }
      }
    }
  };

  const removeImage = async () => {
    if (currentImageUrl) {
      const success = await deleteHeroImage(currentImageUrl);
      if (success) {
        onImageChange(null);
        toast({
          title: 'Success',
          description: 'Hero image removed successfully!',
        });
      }
    } else {
      onImageChange(null);
    }
  };

  return (
    <div>
      <Label>Hero Background Image</Label>
      <div
        className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${currentImageUrl ? 'border-green-500' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
            <p className="text-sm text-gray-600">Uploading and saving image...</p>
          </div>
        ) : uploadSuccess ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm text-green-600">Image saved successfully!</p>
          </div>
        ) : currentImageUrl ? (
          <div className="relative">
            <img
              src={currentImageUrl}
              alt="Hero background preview"
              className="w-full h-40 object-cover rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Click the X to remove, or drag a new image to replace
            </p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop a hero image here, or
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
            <p className="text-xs text-gray-500 mt-2">
              Recommended: 1920x1080 or larger for best quality
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default HeroImageUploader;
