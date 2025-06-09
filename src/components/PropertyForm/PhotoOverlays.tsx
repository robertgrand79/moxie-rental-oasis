
import React from 'react';
import { Star, Heart } from 'lucide-react';

interface PhotoOverlaysProps {
  isSelected: boolean;
  isFeatured: boolean;
}

const PhotoOverlays = ({ isSelected, isFeatured }: PhotoOverlaysProps) => {
  return (
    <>
      {/* Selection overlay - background only, no interactive elements */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/10 pointer-events-none z-10" />
      )}

      {/* Featured overlay - background only, no interactive elements */}
      {isFeatured && !isSelected && (
        <div className="absolute inset-0 bg-red-500/10 pointer-events-none z-10" />
      )}
    </>
  );
};

export default PhotoOverlays;
