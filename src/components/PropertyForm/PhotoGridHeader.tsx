
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Heart } from 'lucide-react';

interface PhotoGridHeaderProps {
  photoCount: number;
  featuredCount: number;
}

const PhotoGridHeader = ({ photoCount, featuredCount }: PhotoGridHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold">Photo Gallery ({photoCount} photos)</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            Cover Photo
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            Featured: {featuredCount}/10
          </Badge>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Hover photos to select cover and featured images
      </p>
    </div>
  );
};

export default PhotoGridHeader;
