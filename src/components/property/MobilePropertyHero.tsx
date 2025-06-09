
import React from 'react';
import { ArrowLeft, Share, Heart, MapPin, Star, Bed, Bath, Users } from 'lucide-react';
import { Property } from '@/types/property';
import { Button } from '@/components/ui/button';
import OptimizedImage from '@/components/ui/optimized-image';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface MobilePropertyHeroProps {
  property: Property;
  coverImage: string;
  onBackClick?: () => void;
  onShareClick?: () => void;
  onFavoriteClick?: () => void;
}

const MobilePropertyHero = ({ 
  property, 
  coverImage, 
  onBackClick, 
  onShareClick, 
  onFavoriteClick 
}: MobilePropertyHeroProps) => {
  return (
    <div className="relative">
      {/* Mobile Image Container with Aspect Ratio */}
      <AspectRatio ratio={4/3} className="w-full">
        <div className="relative w-full h-full overflow-hidden">
          <OptimizedImage
            src={coverImage}
            alt={property.title}
            className="w-full h-full object-cover"
            priority={true}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
        </div>
      </AspectRatio>
      
      {/* Content Overlay */}
      <div className="absolute inset-0">
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackClick}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onShareClick}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0"
              >
                <Share className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onFavoriteClick}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="mb-2">
            <h1 className="text-xl md:text-2xl font-bold mb-2 leading-tight">
              {property.title}
            </h1>
            
            <div className="flex items-center text-sm mb-3 text-white/90">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.location}</span>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <Bed className="h-3 w-3 mr-1" />
              <span className="text-xs font-medium">{property.bedrooms}</span>
            </div>
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <Bath className="h-3 w-3 mr-1" />
              <span className="text-xs font-medium">{property.bathrooms}</span>
            </div>
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <Users className="h-3 w-3 mr-1" />
              <span className="text-xs font-medium">{property.max_guests}</span>
            </div>
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold">
              ${property.price_per_night}
              <span className="text-sm font-normal text-white/80">/night</span>
            </div>
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <Star className="h-3 w-3 mr-1 text-yellow-400 fill-current" />
              <span className="text-xs font-medium">4.8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobilePropertyHero;
