
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
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
      <div className="flex gap-2">
        {/* Cover photo button */}
        <Button
          type="button"
          variant={isSelected ? "default" : "secondary"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onCoverSelect(index);
          }}
          disabled={disabled}
          title={isSelected ? "Cover photo" : "Set as cover"}
        >
          <Star className={`h-3 w-3 ${isSelected ? 'fill-current' : ''}`} />
        </Button>

        {/* Featured photo button */}
        <Button
          type="button"
          variant={isFeatured ? "default" : "secondary"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled && (isFeatured || canAddMoreFeatured)) {
              onFeaturedToggle(photoUrl);
            }
          }}
          disabled={disabled || (!isFeatured && !canAddMoreFeatured)}
          title={isFeatured ? "Remove from featured" : "Add to featured"}
        >
          <Heart className={`h-3 w-3 ${isFeatured ? 'fill-current' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

export default PhotoActionButtons;
