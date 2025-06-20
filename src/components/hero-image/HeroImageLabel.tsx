
import React from 'react';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle } from 'lucide-react';

interface HeroImageLabelProps {
  isUploading: boolean;
  hasImage: boolean;
}

const HeroImageLabel = ({ isUploading, hasImage }: HeroImageLabelProps) => {
  return (
    <Label className="flex items-center gap-2">
      Hero Background Image
      {isUploading && (
        <div className="flex items-center gap-1 text-blue-600">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-xs">Uploading...</span>
        </div>
      )}
      {hasImage && !isUploading && (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="h-3 w-3" />
          <span className="text-xs">Saved</span>
        </div>
      )}
    </Label>
  );
};

export default HeroImageLabel;
