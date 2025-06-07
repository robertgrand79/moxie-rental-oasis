
import React from 'react';
import { Wifi, Car, ChefHat, Tv, Star } from 'lucide-react';

interface AmenityIconProps {
  amenity: string;
}

const AmenityIcon = ({ amenity }: AmenityIconProps) => {
  const getIconAndColor = (amenityName: string) => {
    const name = amenityName.toLowerCase();
    
    switch (name) {
      case 'wifi':
        return { Icon: Wifi, color: 'text-icon-blue' };
      case 'kitchen':
      case 'kitchenette':
        return { Icon: ChefHat, color: 'text-icon-emerald' };
      case 'parking':
        return { Icon: Car, color: 'text-icon-gray' };
      case 'tv':
        return { Icon: Tv, color: 'text-icon-purple' };
      default:
        return { Icon: Star, color: 'text-icon-amber' };
    }
  };

  const { Icon, color } = getIconAndColor(amenity);

  return <Icon className={`h-4 w-4 ${color} transition-colors duration-200`} />;
};

export default AmenityIcon;
