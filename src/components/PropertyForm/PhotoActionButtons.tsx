
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
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 z-40 pointer-events-none group-hover:pointer-events-auto">
      <div className="flex gap-2 pointer-events-auto">
        {/* Cover photo button */}
        <Button
          type="button"
          variant={isSelected ? "default" : "secondary"}
          size="sm"
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
          className="z-50 pointer-events-auto"
        >
          <Star className={`h-3 w-3 ${isSelected ? 'fill-current' : ''}`} />
        </Button>

        {/* Featured photo button */}
        <Button
          type="button"
          variant={isFeatured ? "default" : "secondary"}
          size="sm"
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
          className="z-50 pointer-events-auto"
        >
          <Heart className={`h-3 w-3 ${isFeatured ? 'fill-current' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

export default PhotoActionButtons;
