
import React from 'react';
import { Upload } from 'lucide-react';

interface HeroImageDropzoneProps {
  dragActive: boolean;
  isUploading: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const HeroImageDropzone = ({
  dragActive,
  isUploading,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileChange
}: HeroImageDropzoneProps) => {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      } ${isUploading ? 'opacity-75' : ''}`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
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
          onChange={onFileChange}
          disabled={isUploading}
        />
      </label>
      <p className="text-xs text-gray-500 mt-2">
        Recommended: 1920x1080 or larger. Max size: 50MB
      </p>
      <p className="text-xs text-gray-500">
        Supported formats: JPEG, PNG, WebP, GIF
      </p>
    </div>
  );
};

export default HeroImageDropzone;
