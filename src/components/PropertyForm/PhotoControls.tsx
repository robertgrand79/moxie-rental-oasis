
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, X } from 'lucide-react';

interface Photo {
  id: string;
  url: string;
  isExisting: boolean;
}

interface PhotoControlsProps {
  photo: Photo;
  index: number;
  totalPhotos: number;
  disabled: boolean;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onRemove: (index: number) => void;
}

const PhotoControls = ({
  photo,
  index,
  totalPhotos,
  disabled,
  onMoveUp,
  onMoveDown,
  onRemove
}: PhotoControlsProps) => {
  return (
    <div className="absolute bottom-2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Move buttons */}
      <div className="flex gap-1">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp(index);
          }}
          disabled={disabled || index === 0}
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown(index);
          }}
          disabled={disabled || index === totalPhotos - 1}
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>

      {/* Remove button for new uploads */}
      {!photo.isExisting && !disabled && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default PhotoControls;
