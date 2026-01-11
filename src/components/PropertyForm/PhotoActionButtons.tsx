
import React from 'react';
import { Button } from '@/components/ui/button';
import { Star, Heart } from 'lucide-react';

interface PhotoActionButtonsProps {
  isSelected: boolean;
  isFeatured: boolean;
  canAddMoreFeatured: boolean;
  disabled: boolean;
  index: number;
  photoUrl: string;
  onCoverSelect: (index: number) => void;
  onFeaturedToggle: (imageUrl: string) => void;
}

const PhotoActionButtons = ({
  isSelected,
  isFeatured,
  canAddMoreFeatured,
  disabled,
  index,
  photoUrl,
  onCoverSelect,
  onFeaturedToggle
}: PhotoActionButtonsProps) => {
  return (
    <div className="absolute top-2 left-2 flex gap-1 z-50">
      {/* Cover photo button */}
      <Button
        type="button"
        variant={isSelected ? "default" : "secondary"}
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) {
            console.log('Cover button clicked for index:', index);
            onCoverSelect(index);
          }
        }}
        disabled={disabled}
        title={isSelected ? "Cover photo" : "Set as cover"}
        className="h-8 w-8 min-h-[32px] min-w-[32px] shadow-md"
      >
        <Star className={`h-4 w-4 ${isSelected ? 'fill-current text-yellow-400' : ''}`} />
      </Button>

      {/* Featured photo button */}
      <Button
        type="button"
        variant={isFeatured ? "default" : "secondary"}
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled && (isFeatured || canAddMoreFeatured)) {
            console.log('Featured button clicked for photo:', photoUrl);
            onFeaturedToggle(photoUrl);
          }
        }}
        disabled={disabled || (!isFeatured && !canAddMoreFeatured)}
        title={isFeatured ? "Remove from featured" : "Add to featured"}
        className="h-8 w-8 min-h-[32px] min-w-[32px] shadow-md"
      >
        <Heart className={`h-4 w-4 ${isFeatured ? 'fill-current text-red-500' : ''}`} />
      </Button>
    </div>
  );
};

export default PhotoActionButtons;
