import React, { useState, useEffect } from 'react';

interface AnimatedBackgroundProps {
  imageUrl?: string;
}

const AnimatedBackground = ({ imageUrl }: AnimatedBackgroundProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setImageLoaded(false);
      setHasError(false);
      return;
    }

    setImageLoaded(false);
    setHasError(false);

    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setHasError(true);
    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  const showImage = imageUrl && imageLoaded && !hasError;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient - always present */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900"></div>
      
      {/* Animated elements while loading or as fallback */}
      {!showImage && (
        <>
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-gray-600/20 to-gray-500/30 animate-pulse"></div>
          
          <div className="absolute top-20 left-20 w-32 h-32 bg-gray-400/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-gray-300/10 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gray-500/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-gray-600/10 rounded-full blur-xl animate-pulse delay-3000"></div>
          
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}></div>
          </div>
          
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full animate-ping delay-1000"></div>
            <div className="absolute top-3/4 left-1/4 w-1 h-1 bg-gray-300 rounded-full animate-ping delay-2000"></div>
            <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-gray-400 rounded-full animate-ping delay-3000"></div>
            <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-gray-200 rounded-full animate-ping delay-4000"></div>
          </div>
        </>
      )}
      
      {/* Image with fade-in after fully loaded */}
      {showImage && (
        <>
          <img
            src={imageUrl}
            alt="Hero background"
            className="absolute inset-0 w-full h-full object-cover animate-fade-in"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </>
      )}
    </div>
  );
};

export default AnimatedBackground;
