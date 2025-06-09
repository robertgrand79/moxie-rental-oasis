
import React from 'react';

interface PhotoGridInstructionsProps {
  featuredCount: number;
}

const PhotoGridInstructions = ({ featuredCount }: PhotoGridInstructionsProps) => {
  return (
    <div className="text-center space-y-2">
      <p className="text-xs text-muted-foreground">
        The starred image will be used as the cover photo for your property listing.
      </p>
      <p className="text-xs text-muted-foreground">
        Featured photos (♥) will be displayed in the property page gallery (max 10).
      </p>
      {featuredCount === 10 && (
        <p className="text-xs text-amber-600">
          Maximum of 10 featured photos selected. Remove a photo to choose a different one.
        </p>
      )}
    </div>
  );
};

export default PhotoGridInstructions;
