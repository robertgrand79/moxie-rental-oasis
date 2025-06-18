
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  responsiveSizes?: {
    thumbnail?: string;
    medium?: string;
    large?: string;
  };
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  className?: string;
  fallback?: string;
  showProgressiveLoading?: boolean;
  aspectRatio?: 'square' | '16:9' | '4:3' | 'auto';
}

const OptimizedImage = ({ 
  src, 
  alt, 
  responsiveSizes,
  width, 
  height, 
  priority = false, 
  quality = 80,
  className,
  fallback,
  showProgressiveLoading = true,
  aspectRatio = 'auto',
  ...props 
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [blurDataUrl, setBlurDataUrl] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate blur placeholder
  useEffect(() => {
    if (!showProgressiveLoading) return;
    
    const generateBlurPlaceholder = async () => {
      try {
        // Create a tiny canvas for blur effect
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 10;
        canvas.height = 10;
        
        if (ctx) {
          // Create a simple gradient as placeholder
          const gradient = ctx.createLinearGradient(0, 0, 10, 10);
          gradient.addColorStop(0, '#f3f4f6');
          gradient.addColorStop(1, '#e5e7eb');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 10, 10);
          
          setBlurDataUrl(canvas.toDataURL());
        }
      } catch (error) {
        console.log('Could not generate blur placeholder:', error);
      }
    };

    generateBlurPlaceholder();
  }, [showProgressiveLoading]);

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
  const generateSrcSet = () => {
    if (!responsiveSizes) return undefined;

    const sources = [];
    if (responsiveSizes.thumbnail) sources.push(`${responsiveSizes.thumbnail} 300w`);
    if (responsiveSizes.medium) sources.push(`${responsiveSizes.medium} 768w`);
    if (responsiveSizes.large) sources.push(`${responsiveSizes.large} 1200w`);
    
    return sources.length > 0 ? sources.join(', ') : undefined;
  };

  const generateSizes = () => {
    return "(max-width: 300px) 300px, (max-width: 768px) 768px, 1200px";
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case '16:9': return 'aspect-video';
      case '4:3': return 'aspect-[4/3]';
      default: return '';
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    if (fallback) {
      setIsLoaded(true);
    }
  };

  const srcSet = generateSrcSet();
  const sizesAttr = generateSizes();

  return (
    <div 
      ref={imgRef}
      className={cn(
        "relative overflow-hidden",
        getAspectRatioClass(),
        className
      )}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {showProgressiveLoading && blurDataUrl && !isLoaded && (
        <div 
          className="absolute inset-0 bg-cover bg-center blur-sm scale-110 transition-opacity duration-300"
          style={{ 
            backgroundImage: `url(${blurDataUrl})`,
            width: width || '100%', 
            height: height || '100%' 
          }}
        />
      )}

      {/* Loading placeholder without progressive loading */}
      {!showProgressiveLoading && !isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}

      {/* Actual image */}
      {isInView && (
        <picture>
          {/* WebP source if available */}
          {srcSet && (
            <source 
              srcSet={srcSet.replace(/\.(jpg|jpeg|png)/g, '.webp')} 
              sizes={sizesAttr}
              type="image/webp" 
            />
          )}
          
          <img
            src={hasError && fallback ? fallback : (responsiveSizes?.large || src)}
            srcSet={srcSet}
            sizes={sizesAttr}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-500 w-full h-full object-cover",
              isLoaded ? "opacity-100" : "opacity-0"
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
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div>Image unavailable</div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {!isLoaded && !hasError && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
