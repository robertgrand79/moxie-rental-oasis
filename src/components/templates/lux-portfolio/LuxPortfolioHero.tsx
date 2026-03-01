import React, { useState, useEffect, useCallback } from 'react';
import { getOptimizedImageUrl } from '@/utils/imageOptimization';
import { ChevronDown } from 'lucide-react';

interface LuxPortfolioHeroProps {
  images: string[];
  headline?: string;
  subheadline?: string;
}

const LuxPortfolioHero: React.FC<LuxPortfolioHeroProps> = ({
  images,
  headline = 'A Curated Collection of Exceptional Homes',
  subheadline = 'Handpicked residences for the discerning traveler',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const heroImages = images.slice(0, 4).filter(Boolean);

  const advance = useCallback(() => {
    if (heroImages.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % heroImages.length);
  }, [heroImages.length]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(advance, 6000);
    return () => clearInterval(timer);
  }, [advance, heroImages.length]);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight - 80, behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background images with crossfade */}
      {heroImages.map((img, i) => (
        <img
          key={img}
          src={getOptimizedImageUrl(img, { width: 1920, quality: 50, format: 'webp' })}
          alt=""
          aria-hidden
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${
            i === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
          fetchPriority={i === 0 ? 'high' : 'auto'}
        />
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="text-xs tracking-[0.3em] uppercase text-white/60 mb-8">
          Portfolio
        </p>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.1] mb-8">
          {headline}
        </h1>

        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
          {subheadline}
        </p>

        {/* Image indicators */}
        {heroImages.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-16">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-[2px] rounded-full transition-all duration-700 ${
                  i === activeIndex ? 'w-12 bg-white' : 'w-6 bg-white/30'
                }`}
                aria-label={`Show image ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Scroll chevron */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-white/40 hover:text-white/80 transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown className="h-7 w-7" strokeWidth={1} />
      </button>
    </section>
  );
};

export default LuxPortfolioHero;
