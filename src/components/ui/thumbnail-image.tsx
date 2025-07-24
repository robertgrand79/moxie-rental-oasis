
import React from 'react';
import OptimizedImage from './optimized-image';

interface ThumbnailImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: boolean;
}

const ThumbnailImage = ({ 
  src, 
  alt, 
  className,
  fallbackIcon = true
}: ThumbnailImageProps) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      fallbackIcon={fallbackIcon}
      width={400}
      height={300}
      quality={85}
      priority={false}
    />
  );
};

export default ThumbnailImage;
