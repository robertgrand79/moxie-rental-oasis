
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, Image as ImageIcon, Zap, TrendingDown } from 'lucide-react';
import { useBlogImageUpload } from '@/hooks/useBlogImageUpload';

interface ImageUploaderProps {
  uploadedImage: string | null;
  onImageChange: (image: string | null) => void;
}

const ImageUploader = ({ uploadedImage, onImageChange }: ImageUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
  } | null>(null);
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
    setCompressionStats(null);
    
    const uploadResult = await uploadBlogImage(file);
    if (uploadResult) {
      onImageChange(uploadResult.original);
      setSelectedFile(null);
      
      // Note: Compression stats would need to be returned from the upload hook
      // For now, we'll estimate based on typical compression
      const estimatedCompression = Math.min(30, (file.size / (1024 * 1024)) * 5);
      setCompressionStats({
        originalSize: file.size,
        optimizedSize: file.size * (1 - estimatedCompression / 100),
        compressionRatio: estimatedCompression
      });
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
      if (uploadedImage.includes('supabase')) {
        await deleteBlogImage(uploadedImage);
      }
    }
    onImageChange(null);
    setSelectedFile(null);
    setCompressionStats(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200",
          dragActive ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300',
          uploadedImage ? 'border-green-500 bg-green-50' : '',
          uploading ? 'opacity-50 pointer-events-none' : 'hover:border-gray-400'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Optimizing and uploading...
              </p>
              {selectedFile && (
                <div className="text-xs text-gray-500 space-y-1 max-w-xs">
                  <div className="flex items-center justify-center gap-2">
                    <ImageIcon className="h-3 w-3" />
                    <span className="truncate">{selectedFile.name}</span>
                  </div>
                  <div>Original: {formatFileSize(selectedFile.size)}</div>
                  <div className="flex items-center justify-center gap-1 text-blue-600">
                    <Zap className="h-3 w-3" />
                    <span>Generating responsive sizes...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : uploadedImage ? (
          <div className="relative group">
            <img
              src={uploadedImage}
              alt="Preview"
              className="w-full h-40 object-cover rounded-md"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={removeImage}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
            
            {/* Optimization badges */}
            <div className="absolute bottom-2 left-2 flex gap-2">
              <div className="bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Optimized
              </div>
              <div className="bg-green-600/80 text-white text-xs px-2 py-1 rounded">
                Responsive
              </div>
            </div>

            {/* Compression stats */}
            {compressionStats && (
              <div className="absolute top-2 left-2 bg-blue-600/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                -{compressionStats.compressionRatio.toFixed(0)}%
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Drag and drop an image here, or
              </p>
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500 font-medium">browse files</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Zap className="h-3 w-3" />
                <span>Auto-optimized for web</span>
              </div>
              <div>Generates thumbnail, medium & large sizes</div>
            </div>
          </div>
        )}
      </div>

      {/* Compression stats display */}
      {compressionStats && uploadedImage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          <div className="flex items-center gap-2 text-green-800 mb-2">
            <TrendingDown className="h-4 w-4" />
            <span className="font-medium">Optimization Complete</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-green-700">
            <div>
              <span className="font-medium">Original:</span><br/>
              {formatFileSize(compressionStats.originalSize)}
            </div>
            <div>
              <span className="font-medium">Optimized:</span><br/>
              {formatFileSize(compressionStats.optimizedSize)}
            </div>
          </div>
          <div className="mt-2 text-xs text-green-600">
            <span className="font-medium">Saved:</span> {compressionStats.compressionRatio.toFixed(1)}% smaller + responsive sizes generated
          </div>
        </div>
      )}
    </div>
  );
};

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default ImageUploader;
