
import React from 'react';
import { Star, Heart } from 'lucide-react';

interface PhotoOverlaysProps {
  isSelected: boolean;
  isFeatured: boolean;
}

const PhotoOverlays = ({ isSelected, isFeatured }: PhotoOverlaysProps) => {
  return (
    <>
      {/* Selection overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none">
          <div className="bg-primary text-primary-foreground rounded-full p-2">
            <Star className="h-4 w-4 fill-current" />
          </div>
        </div>
      )}

      {/* Featured overlay */}
      {isFeatured && !isSelected && (
        <div className="absolute inset-0 bg-red-500/10 pointer-events-none" />
      )}
    </>
  );
};

export default PhotoOverlays;
