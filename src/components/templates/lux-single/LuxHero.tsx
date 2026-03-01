import React from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { Property } from '@/types/property';
import { getOptimizedImageUrl } from '@/utils/imageOptimization';

interface LuxHeroProps {
  property: Property;
  coverImage: string;
}

const LuxHero: React.FC<LuxHeroProps> = ({ property, coverImage }) => {
  const optimizedSrc = getOptimizedImageUrl(coverImage, {
    width: 1920,
    quality: 50,
    format: 'webp',
  });

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight - 80, behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Edge-to-edge background image */}
      <img
        src={optimizedSrc}
        alt={property.title}
        className="absolute inset-0 w-full h-full object-cover"
        fetchPriority="high"
      />

      {/* Dark gradient overlay — heavier at bottom for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {/* Content */}
      <div className="relative z-10 w-full pb-24 pt-40 px-6 md:px-12 lg:px-20">
        <div className="max-w-4xl">
          {property.location && (
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="h-4 w-4 text-white/70" />
              <span className="uppercase tracking-widest text-sm text-white/70 font-medium">
                {property.location}
              </span>
            </div>
          )}

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.1] mb-6">
            {property.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-white/80 text-sm uppercase tracking-widest">
            {property.max_guests && (
              <span>{property.max_guests} Guests</span>
            )}
            {property.bedrooms && (
              <span className="before:content-['·'] before:mr-6">{property.bedrooms} Bedrooms</span>
            )}
            {property.bathrooms && (
              <span className="before:content-['·'] before:mr-6">{property.bathrooms} Bathrooms</span>
            )}
          </div>
        </div>
      </div>

      {/* Scroll-down chevron */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/60 hover:text-white transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown className="h-8 w-8" />
      </button>
    </section>
  );
};

export default LuxHero;
