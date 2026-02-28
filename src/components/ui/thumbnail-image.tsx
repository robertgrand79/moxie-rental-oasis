
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
      height={280}
      quality={50}
      priority={false}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
    />
  );
};

export default ThumbnailImage;
