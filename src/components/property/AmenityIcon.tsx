
import React from 'react';
import { Wifi, Car, ChefHat, Tv, Star } from 'lucide-react';

interface AmenityIconProps {
  amenity: string;
}

const AmenityIcon = ({ amenity }: AmenityIconProps) => {
  switch (amenity.toLowerCase()) {
    case 'wifi':
      return <Wifi className="h-4 w-4" />;
    case 'kitchen':
    case 'kitchenette':
      return <ChefHat className="h-4 w-4" />;
    case 'parking':
      return <Car className="h-4 w-4" />;
    case 'tv':
      return <Tv className="h-4 w-4" />;
    default:
      return <Star className="h-4 w-4" />;
  }
};

export default AmenityIcon;
