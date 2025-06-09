
import React from 'react';
import { Star, Heart } from 'lucide-react';

interface PhotoIndicatorsProps {
  isSelected: boolean;
  isFeatured: boolean;
  index: number;
}

const PhotoIndicators = ({ isSelected, isFeatured, index }: PhotoIndicatorsProps) => {
  return (
    <>
      {/* Cover indicator */}
      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
        {isSelected && <Star className="h-3 w-3 fill-current text-yellow-400" />}
        {isSelected ? 'Cover' : index + 1}
      </div>

      {/* Featured indicator */}
      {isFeatured && (
        <div className="absolute top-2 right-14 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Heart className="h-3 w-3 fill-current" />
        </div>
      )}
    </>
  );
};

export default PhotoIndicators;
