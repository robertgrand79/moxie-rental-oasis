import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Images, Loader2 } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  width?: number;
  height?: number;
}

const OptimizedImage = ({
  src,
  alt,
  className,
  fallbackIcon = true,
  priority = false,
  sizes,
  quality = 80,
  width,
  height,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [useOriginalSrc, setUseOriginalSrc] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading (unless priority)
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // Start loading 100px before entering viewport
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  // Reset states when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setUseOriginalSrc(false);
    if (priority) setIsInView(true);
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    // If we were trying an optimized URL, fall back to the original src via React state
    if (!useOriginalSrc && src) {
      setUseOriginalSrc(true);
      return;
    }
    setHasError(true);
    setIsLoaded(false);
  };

  // Don't render anything if no src provided
  if (!src) {
    return (
      <div className={cn("relative overflow-hidden bg-gray-100 flex items-center justify-center", className)}>
        {fallbackIcon && <Images className="h-8 w-8 text-gray-400" />}
      </div>
    );
  }

  // Use original src directly - images are already optimized WebP from the upload pipeline
  const imageSrc = src;

  return (
    <div
      ref={imgRef}
      className={cn("relative overflow-hidden bg-gray-100", className)}
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && isInView && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
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
      {(isInView || priority) && (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          referrerPolicy="no-referrer"
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...props}
        />
      )}

      {/* Blur-up placeholder */}
      {!isLoaded && isInView && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 opacity-50" />
      )}
    </div>
  );
};

export default OptimizedImage;