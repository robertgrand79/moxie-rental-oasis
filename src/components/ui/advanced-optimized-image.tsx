
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAdvancedImageOptimization } from '@/hooks/useAdvancedImageOptimization';

interface AdvancedOptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  fallback?: string;
  aspectRatio?: 'square' | '16:9' | '4:3' | 'auto';
  enableAnalytics?: boolean;
  transformParams?: {
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    blur?: number;
    grayscale?: boolean;
    brightness?: number;
    contrast?: number;
    sharp?: boolean;
  };
}

const AdvancedOptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false, 
  className,
  fallback,
  aspectRatio = 'auto',
  enableAnalytics = true,
  transformParams = {},
  ...props 
}: AdvancedOptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [loadStartTime, setLoadStartTime] = useState<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const { 
    generateResponsiveSources, 
    getOptimalFormat, 
    generateSmartPlaceholder,
    getTransformedImageUrl,
    recordPerformanceMetric 
  } = useAdvancedImageOptimization();

  // Generate responsive sources automatically
  const responsiveSources = generateResponsiveSources(src, transformParams.format);
  const optimalFormat = getOptimalFormat();
  const smartPlaceholder = generateSmartPlaceholder(src);

  // Generate optimized source URL
  const optimizedSrc = getTransformedImageUrl(src, {
    width,
    height,
    format: transformParams.format || optimalFormat as any,
    quality: transformParams.quality,
    blur: transformParams.blur,
    grayscale: transformParams.grayscale,
    brightness: transformParams.brightness,
    contrast: transformParams.contrast,
    sharp: transformParams.sharp
  });

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setLoadStartTime(performance.now());
          observerRef.current?.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observerRef.current.observe(imgRef.current);
    return () => observerRef.current?.disconnect();
  }, [priority]);

  // Set load start time for priority images
  useEffect(() => {
    if (priority) {
      setLoadStartTime(performance.now());
    }
  }, [priority]);

  const generateSrcSet = () => {
    if (!responsiveSources) return undefined;

    const sources = [];
    if (responsiveSources.thumbnail) sources.push(`${responsiveSources.thumbnail} 300w`);
    if (responsiveSources.medium) sources.push(`${responsiveSources.medium} 768w`);
    if (responsiveSources.large) sources.push(`${responsiveSources.large} 1200w`);
    if (responsiveSources.xlarge) sources.push(`${responsiveSources.xlarge} 1920w`);
    
    return sources.length > 0 ? sources.join(', ') : undefined;
  };

  const generateSizes = () => {
    return "(max-width: 300px) 300px, (max-width: 768px) 768px, (max-width: 1200px) 1200px, 1920px";
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
    
    // Record performance metrics
    if (enableAnalytics && loadStartTime) {
      const loadTime = performance.now() - loadStartTime;
      recordPerformanceMetric(src, loadTime);
    }
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
      {/* Smart blur placeholder */}
      {smartPlaceholder && !isLoaded && (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{ 
            backgroundImage: `url(${smartPlaceholder})`,
            filter: 'blur(10px)',
            transform: 'scale(1.1)'
          }}
        />
      )}

      {/* Loading placeholder */}
      {!smartPlaceholder && !isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
          style={{ width, height }}
        />
      )}

      {/* Main image */}
      {isInView && (
        <picture className="block w-full h-full">
          {/* AVIF source */}
          {srcSet && optimalFormat === 'avif' && (
            <source 
              srcSet={srcSet.replace(/\.(jpg|jpeg|png|webp)/g, '.avif')} 
              sizes={sizesAttr}
              type="image/avif" 
            />
          )}
          
          {/* WebP source */}
          {srcSet && ['webp', 'avif'].includes(optimalFormat) && (
            <source 
              srcSet={srcSet.replace(/\.(jpg|jpeg|png)/g, '.webp')} 
              sizes={sizesAttr}
              type="image/webp" 
            />
          )}
          
          <img
            src={hasError && fallback ? fallback : optimizedSrc}
            srcSet={srcSet}
            sizes={sizesAttr}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-all duration-700 w-full h-full object-cover",
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
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

      {/* Loading indicator for priority images */}
      {!isLoaded && !hasError && isInView && priority && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Optimization badge (visible on hover in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-green-600/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <span>⚡</span>
            <span>Optimized</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedOptimizedImage;
