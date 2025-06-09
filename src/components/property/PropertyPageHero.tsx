
import React from 'react';
import { MapPin, Star, Bed, Bath, Users } from 'lucide-react';
import { Property } from '@/types/property';
import OptimizedImage from '@/components/ui/optimized-image';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface PropertyPageHeroProps {
  property: Property;
  coverImage: string;
}

const PropertyPageHero = ({ property, coverImage }: PropertyPageHeroProps) => {
  return (
    <div className="relative w-full">
      {/* Image Container with Aspect Ratio */}
      <AspectRatio ratio={16/9} className="w-full">
        <div className="relative w-full h-full overflow-hidden">
          <OptimizedImage
            src={coverImage}
            alt={property.title}
            className="w-full h-full object-cover"
            priority={true}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
        </div>
      </AspectRatio>
      
      {/* Content Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-4xl mx-auto">
          {/* Property Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight animate-fade-in">
            {property.title}
          </h1>
          
          {/* Location */}
          <div className="flex items-center justify-center text-base md:text-lg lg:text-xl mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <MapPin className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 mr-2" />
            <span>{property.location}</span>
          </div>
          
          {/* Property Stats */}
          <div className="flex items-center justify-center space-x-4 md:space-x-6 lg:space-x-8 mb-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-2">
              <Bed className="h-4 w-4 mr-2" />
              <span className="font-semibold text-sm md:text-base">{property.bedrooms}</span>
            </div>
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-2">
              <Bath className="h-4 w-4 mr-2" />
              <span className="font-semibold text-sm md:text-base">{property.bathrooms}</span>
            </div>
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-2">
              <Users className="h-4 w-4 mr-2" />
              <span className="font-semibold text-sm md:text-base">{property.max_guests}</span>
            </div>
          </div>
          
          {/* Price */}
          <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold">
              ${property.price_per_night}
              <span className="text-lg md:text-xl lg:text-2xl font-normal text-white/80">/night</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPageHero;
