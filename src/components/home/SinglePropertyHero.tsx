import React from 'react';
import { Property } from '@/types/property';
import { Bed, Bath, Users, MapPin } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface SinglePropertyHeroProps {
  property: Property;
  coverImage: string;
}

const SinglePropertyHero: React.FC<SinglePropertyHeroProps> = ({ property, coverImage }) => {
  return (
    <section className="relative w-full">
      <AspectRatio ratio={16/7} className="w-full">
        <img
          src={coverImage}
          alt={property.title}
          className="object-cover w-full h-full"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end items-center p-6 md:p-12 lg:p-16">
          <div className="max-w-4xl text-center">
            {/* Location */}
            {property.location && (
              <div className="flex items-center justify-center gap-2 text-white/80 mb-3">
                <MapPin className="h-5 w-5" />
                <span className="text-sm md:text-base">
                  {property.location}
                </span>
              </div>
            )}
            
            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {property.title}
            </h1>
            
            {/* Quick stats */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Bed className="h-5 w-5 text-white" />
                <span className="text-white font-medium">
                  {property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Bath className="h-5 w-5 text-white" />
                <span className="text-white font-medium">
                  {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Users className="h-5 w-5 text-white" />
                <span className="text-white font-medium">
                  Up to {property.max_guests || 4} Guests
                </span>
              </div>
            </div>
          </div>
        </div>
      </AspectRatio>
    </section>
  );
};

export default SinglePropertyHero;
