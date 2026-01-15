
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
      width={600}
      height={400}
      quality={70}
      priority={false}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    />
  );
};

export default ThumbnailImage;
