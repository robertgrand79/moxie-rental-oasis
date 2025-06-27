
import React from 'react';

interface PhotoGridInstructionsProps {
  featuredCount: number;
  deletedCount?: number;
}

const PhotoGridInstructions = ({ featuredCount, deletedCount = 0 }: PhotoGridInstructionsProps) => {
  return (
    <div className="text-center space-y-2">
      <p className="text-xs text-muted-foreground">
        The starred image will be used as the cover photo for your property listing.
      </p>
      <p className="text-xs text-muted-foreground">
        Featured photos (♥) will be displayed in the property page gallery (max 10).
      </p>
      <p className="text-xs text-muted-foreground">
        Click the trash icon to delete photos. Existing photos will be marked for deletion and removed when you save.
      </p>
      {featuredCount === 10 && (
        <p className="text-xs text-amber-600">
          Maximum of 10 featured photos selected. Remove a photo to choose a different one.
        </p>
      )}
      {deletedCount > 0 && (
        <p className="text-xs text-destructive">
          {deletedCount} photo{deletedCount > 1 ? 's' : ''} marked for deletion. Save the form to permanently remove them.
        </p>
      )}
    </div>
  );
};

export default PhotoGridInstructions;
