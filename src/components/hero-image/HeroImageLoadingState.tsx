
import React from 'react';
import { Loader2 } from 'lucide-react';

const HeroImageLoadingState = () => {
  return (
    <div className="flex flex-col items-center">
      <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-2" />
      <p className="text-sm text-blue-600 font-medium">
        Uploading and saving your hero image...
      </p>
    </div>
  );
};

export default HeroImageLoadingState;
