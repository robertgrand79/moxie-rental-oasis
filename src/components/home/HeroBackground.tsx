
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

  // Show skeleton loading only when we have an image URL and haven't tested it yet
  if (imageUrl && !imageStatus.tested) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800"></div>
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="space-y-8 animate-pulse">
            <div className="h-16 bg-white/10 rounded-lg animate-pulse"></div>
            <div className="h-8 bg-white/10 rounded-lg animate-pulse"></div>
            <div className="h-12 bg-white/10 rounded-full w-48 mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  const shouldUseImage = imageUrl && imageStatus.loaded && !imageStatus.error;

  const backgroundStyle = shouldUseImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${imageUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {
        background: 'linear-gradient(135deg, #6B7280 0%, #374151 100%)'
      };

  console.log('🎨 Using background style:', shouldUseImage ? 'Image' : 'Gradient');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-in-out opacity-0 animate-[fade-in_0.8s_ease-out_forwards]"
        style={backgroundStyle}
      ></div>
      <div className="opacity-0 animate-[fade-in_0.6s_ease-out_0.4s_forwards] w-full">
        {children}
      </div>
    </section>
  );
};

export default HeroBackground;
