
import React, { useState, useEffect } from 'react';
import { useHeroImagePreloading } from '@/hooks/useHeroImagePreloading';

interface HeroBackgroundProps {
  imageUrl: string;
  children: React.ReactNode;
}

const HeroBackground = ({ imageUrl, children }: HeroBackgroundProps) => {
  const [imageStatus, setImageStatus] = useState<{
    loaded: boolean;
    error: boolean;
    tested: boolean;
  }>({
    loaded: false,
    error: false,
    tested: !imageUrl
  });

  const preloadState = useHeroImagePreloading(imageUrl);

  useEffect(() => {
    if (!imageUrl) {
      console.log('⚠️ No hero background image set, using gradient');
      setImageStatus({ loaded: true, error: false, tested: true });
      return;
    }

    // If preloading succeeded, skip the loading test
    if (preloadState.isPreloaded && !preloadState.hasError) {
      console.log('✅ Using preloaded hero image');
      setImageStatus({ loaded: true, error: false, tested: true });
      return;
    }

    // If preloading failed, mark as error
    if (preloadState.isPreloaded && preloadState.hasError) {
      console.log('❌ Preloaded image failed, using gradient fallback');
      setImageStatus({ loaded: false, error: true, tested: true });
      return;
    }

    const imageUrlWithCacheBuster = `${imageUrl}?t=${Date.now()}`;
    console.log('🖼️ Testing hero image with cache buster:', imageUrlWithCacheBuster);
    setImageStatus({ loaded: false, error: false, tested: false });

    const img = new Image();
    
    const handleLoad = () => {
      console.log('✅ Hero image loaded successfully:', imageUrl);
      setImageStatus({ loaded: true, error: false, tested: true });
    };
    
    const handleError = () => {
      console.error('❌ Failed to load hero image:', imageUrl);
      setImageStatus({ loaded: false, error: true, tested: true });
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = imageUrlWithCacheBuster;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, preloadState]);

  // Show neutral background while image is loading
  if (imageUrl && !imageStatus.tested) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/80"></div>
        <div className="relative z-10">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  const shouldUseImage = imageUrl && imageStatus.loaded && !imageStatus.error;

  // Use CSS variable-based gradient for fallback
  const backgroundStyle = shouldUseImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${imageUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {};

  console.log('🎨 Using background style:', shouldUseImage ? 'Image' : 'Gradient');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className={`absolute inset-0 transition-all duration-1000 ease-in-out opacity-0 animate-[fade-in_0.8s_ease-out_forwards] ${
          !shouldUseImage ? 'bg-gradient-to-br from-hero-gradient-from to-hero-gradient-to' : ''
        }`}
        style={backgroundStyle}
      ></div>
      <div className="opacity-0 animate-[fade-in_0.6s_ease-out_0.4s_forwards] w-full">
        {children}
      </div>
    </section>
  );
};

export default HeroBackground;
