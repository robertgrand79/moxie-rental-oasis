
import React from 'react';
import { Images, Star, Heart, Trash2 } from 'lucide-react';

interface PhotoGridHeaderProps {
  photoCount: number;
  featuredCount: number;
  deletedCount?: number;
}

const PhotoGridHeader = ({ photoCount, featuredCount, deletedCount = 0 }: PhotoGridHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Images className="h-4 w-4" />
          <span className="font-medium">{photoCount} Total Photos</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Heart className="h-4 w-4 text-red-500" />
          <span className="font-medium">{featuredCount}/10 Featured</span>
        </div>

        {deletedCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <Trash2 className="h-4 w-4" />
            <span className="font-medium">{deletedCount} Marked for Deletion</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <span>Cover Photo</span>
      </div>
    </div>
  );
};

export default PhotoGridHeader;
