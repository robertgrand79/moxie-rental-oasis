
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface HeroImagePreviewProps {
  imageUrl: string;
  isUploading: boolean;
  onRemove: () => void;
}

const HeroImagePreview = ({ imageUrl, isUploading, onRemove }: HeroImagePreviewProps) => {
  return (
    <div className="relative">
      <img
        src={imageUrl}
        alt="Hero background preview"
        className="w-full h-40 object-cover rounded-md"
        onError={(e) => {
          console.error('Image failed to load:', imageUrl);
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="absolute top-2 right-2"
        onClick={onRemove}
        disabled={isUploading}
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="mt-2 text-xs text-gray-500">
        <p>
          Click the X to remove, or drag a new image to replace
        </p>
      </div>
    </div>
  );
};

export default HeroImagePreview;
