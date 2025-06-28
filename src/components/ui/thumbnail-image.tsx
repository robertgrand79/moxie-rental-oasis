
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Images } from 'lucide-react';

interface ThumbnailImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: boolean;
}

const ThumbnailImage = ({ 
  src, 
  alt, 
  className,
  fallbackIcon = true,
  ...props 
}: ThumbnailImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  // Reset states when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    console.log('✅ Thumbnail loaded successfully:', src);
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    console.error('❌ Thumbnail failed to load:', src);
    setHasError(true);
    setIsLoaded(false);
  };

  // Don't render anything if no src provided
  if (!src) {
    console.warn('⚠️ ThumbnailImage: No src provided');
    return (
      <div className={cn("relative overflow-hidden bg-gray-100 flex items-center justify-center", className)}>
        {fallbackIcon && <Images className="h-8 w-8 text-gray-400" />}
      </div>
    );
  }

  return (
    <div 
      ref={imgRef}
      className={cn("relative overflow-hidden bg-gray-100", className)}
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && isInView && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {hasError && fallbackIcon && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Images className="h-8 w-8 text-gray-400 mx-auto mb-1" />
            <span className="text-xs text-gray-500">Image unavailable</span>
          </div>
        </div>
      )}

      {/* Main image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

export default ThumbnailImage;
