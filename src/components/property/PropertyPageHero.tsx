
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
    <div className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        {/* Property Title */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in">
          {property.title}
        </h1>
        
        {/* Location */}
        <div className="flex items-center justify-center text-xl md:text-2xl mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <MapPin className="h-6 w-6 md:h-8 md:w-8 mr-3" />
          <span>{property.location}</span>
        </div>
        
        {/* Property Stats */}
        <div className="flex items-center justify-center space-x-8 md:space-x-12 mb-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <Bed className="h-5 w-5 mr-2" />
            <span className="font-semibold">{property.bedrooms} Bed</span>
          </div>
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <Bath className="h-5 w-5 mr-2" />
            <span className="font-semibold">{property.bathrooms} Bath</span>
          </div>
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
            <Users className="h-5 w-5 mr-2" />
            <span className="font-semibold">{property.max_guests} Guests</span>
          </div>
        </div>
        
        {/* Rating */}
        <div className="flex items-center justify-center mb-12 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
            <Star className="h-5 w-5 text-yellow-400 fill-current mr-2" />
            <span className="font-semibold text-lg">4.8</span>
            <span className="ml-2 text-white/80">(12 reviews)</span>
          </div>
        </div>
        
        {/* Price */}
        <div className="animate-fade-in" style={{ animationDelay: '800ms' }}>
          <div className="text-4xl md:text-5xl font-bold mb-2">
            ${property.price_per_night}
            <span className="text-2xl md:text-3xl font-normal text-white/80">/night</span>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPageHero;
