
import React from 'react';
import { MapPin, Star, Bed, Bath, Users } from 'lucide-react';
import { Property } from '@/types/property';
import OptimizedImage from '@/components/ui/optimized-image';

interface PropertyPageHeroProps {
  property: Property;
  coverImage: string;
}

const PropertyPageHero = ({ property, coverImage }: PropertyPageHeroProps) => {
  return (
    <div className="relative h-[60vh] min-h-[480px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        {/* Property Title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight animate-fade-in">
          {property.title}
        </h1>
        
        {/* Location */}
        <div className="flex items-center justify-center text-lg md:text-xl mb-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <MapPin className="h-5 w-5 md:h-6 md:w-6 mr-2" />
          <span>{property.location}</span>
        </div>
        
        {/* Property Stats */}
        <div className="flex items-center justify-center space-x-6 md:space-x-8 mb-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-2">
            <Bed className="h-4 w-4 mr-2" />
            <span className="font-semibold">{property.bedrooms}</span>
          </div>
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-2">
            <Bath className="h-4 w-4 mr-2" />
            <span className="font-semibold">{property.bathrooms}</span>
          </div>
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-2">
            <Users className="h-4 w-4 mr-2" />
            <span className="font-semibold">{property.max_guests}</span>
          </div>
        </div>
        
        {/* Price */}
        <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="text-3xl md:text-4xl font-bold">
            ${property.price_per_night}
            <span className="text-xl md:text-2xl font-normal text-white/80">/night</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPageHero;
