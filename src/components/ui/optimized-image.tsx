
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  className?: string;
  fallback?: string;
}

const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false, 
  quality = 80,
  className,
  fallback,
  ...props 
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

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
  }, [priority]);

  // Generate responsive sources
  const generateSources = (originalSrc: string) => {
    if (originalSrc.includes('lovable-uploads') || originalSrc.includes('unsplash.com')) {
      return {
        webp: originalSrc,
        original: originalSrc
      };
    }
    return {
      webp: originalSrc,
      original: originalSrc
    };
  };

  const sources = generateSources(src);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    if (fallback) {
      setIsLoaded(true);
    }
  };

  return (
    <div 
      ref={imgRef}
      className={cn("relative overflow-hidden", className)}
      style={{ width, height }}
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}

      {/* Actual image */}
      {isInView && (
        <picture>
          <source srcSet={sources.webp} type="image/webp" />
          <img
            src={hasError && fallback ? fallback : sources.original}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              className
            )}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            {...props}
          />
        </picture>
      )}

      {/* Error state */}
      {hasError && !fallback && (
        <div 
          className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-400 text-sm"
          style={{ width, height }}
        >
          Image unavailable
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
