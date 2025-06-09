
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Wifi, Car, Utensils, Tv, Waves, Coffee, Wind, Shield, Home, Snowflake, Users, Bath, Bed, Flame, Gamepad2, TreePine, UtensilsCrossed, Zap } from 'lucide-react';
import AmenityCard from './AmenityCard';

interface AmenityGridProps {
  amenities: string;
  isMobile: boolean;
}

const AmenityGrid = ({ amenities, isMobile }: AmenityGridProps) => {
  const [showAll, setShowAll] = useState(false);

  // Enhanced amenity configuration with comprehensive icon mappings
  const amenityConfig: Record<string, { icon: any; color: string; bgColor: string; shadowColor: string }> = {
    // Internet & Technology
    'wifi': { 
      icon: Wifi, 
      color: 'text-icon-blue', 
      bgColor: 'bg-gradient-to-br from-blue-50/80 to-blue-100/80 border-blue-200/50',
      shadowColor: 'shadow-blue-100/50'
    },
    'internet': { 
      icon: Wifi, 
      color: 'text-icon-blue', 
      bgColor: 'bg-gradient-to-br from-blue-50/80 to-blue-100/80 border-blue-200/50',
      shadowColor: 'shadow-blue-100/50'
    },
    'tv': { 
      icon: Tv, 
      color: 'text-icon-purple', 
      bgColor: 'bg-gradient-to-br from-purple-50/80 to-purple-100/80 border-purple-200/50',
      shadowColor: 'shadow-purple-100/50'
    },
    'smart tv': { 
      icon: Tv, 
      color: 'text-icon-purple', 
      bgColor: 'bg-gradient-to-br from-purple-50/80 to-purple-100/80 border-purple-200/50',
      shadowColor: 'shadow-purple-100/50'
    },
    'streaming': { 
      icon: Tv, 
      color: 'text-icon-purple', 
      bgColor: 'bg-gradient-to-br from-purple-50/80 to-purple-100/80 border-purple-200/50',
      shadowColor: 'shadow-purple-100/50'
    },

    // Transportation & Parking
    'parking': { 
      icon: Car, 
      color: 'text-icon-gray', 
      bgColor: 'bg-gradient-to-br from-gray-50/80 to-gray-100/80 border-gray-200/50',
      shadowColor: 'shadow-gray-100/50'
    },
    'free parking': { 
      icon: Car, 
      color: 'text-icon-gray', 
      bgColor: 'bg-gradient-to-br from-gray-50/80 to-gray-100/80 border-gray-200/50',
      shadowColor: 'shadow-gray-100/50'
    },
    'garage': { 
      icon: Car, 
      color: 'text-icon-gray', 
      bgColor: 'bg-gradient-to-br from-gray-50/80 to-gray-100/80 border-gray-200/50',
      shadowColor: 'shadow-gray-100/50'
    },

    // Kitchen & Dining
    'kitchen': { 
      icon: Utensils, 
      color: 'text-icon-emerald', 
      bgColor: 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 border-emerald-200/50',
      shadowColor: 'shadow-emerald-100/50'
    },
    'kitchenette': { 
      icon: Utensils, 
      color: 'text-icon-emerald', 
      bgColor: 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 border-emerald-200/50',
      shadowColor: 'shadow-emerald-100/50'
    },
    'full kitchen': { 
      icon: UtensilsCrossed, 
      color: 'text-icon-emerald', 
      bgColor: 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 border-emerald-200/50',
      shadowColor: 'shadow-emerald-100/50'
    },
    'dining': { 
      icon: UtensilsCrossed, 
      color: 'text-icon-emerald', 
      bgColor: 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 border-emerald-200/50',
      shadowColor: 'shadow-emerald-100/50'
    },
    'coffee': { 
      icon: Coffee, 
      color: 'text-icon-amber', 
      bgColor: 'bg-gradient-to-br from-amber-50/80 to-amber-100/80 border-amber-200/50',
      shadowColor: 'shadow-amber-100/50'
    },
    'coffee maker': { 
      icon: Coffee, 
      color: 'text-icon-amber', 
      bgColor: 'bg-gradient-to-br from-amber-50/80 to-amber-100/80 border-amber-200/50',
      shadowColor: 'shadow-amber-100/50'
    },
    'refrigerator': { 
      icon: Snowflake, 
      color: 'text-icon-indigo', 
      bgColor: 'bg-gradient-to-br from-indigo-50/80 to-indigo-100/80 border-indigo-200/50',
      shadowColor: 'shadow-indigo-100/50'
    },
    'freezer': { 
      icon: Snowflake, 
      color: 'text-icon-indigo', 
      bgColor: 'bg-gradient-to-br from-indigo-50/80 to-indigo-100/80 border-indigo-200/50',
      shadowColor: 'shadow-indigo-100/50'
    },

    // Outdoor & Recreation
    'pool': { 
      icon: Waves, 
      color: 'text-icon-teal', 
      bgColor: 'bg-gradient-to-br from-teal-50/80 to-teal-100/80 border-teal-200/50',
      shadowColor: 'shadow-teal-100/50'
    },
    'hot tub': { 
      icon: Waves, 
      color: 'text-icon-teal', 
      bgColor: 'bg-gradient-to-br from-teal-50/80 to-teal-100/80 border-teal-200/50',
      shadowColor: 'shadow-teal-100/50'
    },
    'spa': { 
      icon: Waves, 
      color: 'text-icon-teal', 
      bgColor: 'bg-gradient-to-br from-teal-50/80 to-teal-100/80 border-teal-200/50',
      shadowColor: 'shadow-teal-100/50'
    },
    'garden': { 
      icon: TreePine, 
      color: 'text-icon-green', 
      bgColor: 'bg-gradient-to-br from-green-50/80 to-green-100/80 border-green-200/50',
      shadowColor: 'shadow-green-100/50'
    },
    'outdoor space': { 
      icon: TreePine, 
      color: 'text-icon-green', 
      bgColor: 'bg-gradient-to-br from-green-50/80 to-green-100/80 border-green-200/50',
      shadowColor: 'shadow-green-100/50'
    },
    'patio': { 
      icon: TreePine, 
      color: 'text-icon-green', 
      bgColor: 'bg-gradient-to-br from-green-50/80 to-green-100/80 border-green-200/50',
      shadowColor: 'shadow-green-100/50'
    },
    'balcony': { 
      icon: TreePine, 
      color: 'text-icon-green', 
      bgColor: 'bg-gradient-to-br from-green-50/80 to-green-100/80 border-green-200/50',
      shadowColor: 'shadow-green-100/50'
    },
    'bbq': { 
      icon: Flame, 
      color: 'text-icon-orange', 
      bgColor: 'bg-gradient-to-br from-orange-50/80 to-orange-100/80 border-orange-200/50',
      shadowColor: 'shadow-orange-100/50'
    },
    'barbecue': { 
      icon: Flame, 
      color: 'text-icon-orange', 
      bgColor: 'bg-gradient-to-br from-orange-50/80 to-orange-100/80 border-orange-200/50',
      shadowColor: 'shadow-orange-100/50'
    },
    'grill': { 
      icon: Flame, 
      color: 'text-icon-orange', 
      bgColor: 'bg-gradient-to-br from-orange-50/80 to-orange-100/80 border-orange-200/50',
      shadowColor: 'shadow-orange-100/50'
    },

    // Bedroom & Bathroom
    'bedroom': { 
      icon: Bed, 
      color: 'text-icon-purple', 
      bgColor: 'bg-gradient-to-br from-purple-50/80 to-purple-100/80 border-purple-200/50',
      shadowColor: 'shadow-purple-100/50'
    },
    'bed': { 
      icon: Bed, 
      color: 'text-icon-purple', 
      bgColor: 'bg-gradient-to-br from-purple-50/80 to-purple-100/80 border-purple-200/50',
      shadowColor: 'shadow-purple-100/50'
    },
    'bathroom': { 
      icon: Bath, 
      color: 'text-icon-blue', 
      bgColor: 'bg-gradient-to-br from-blue-50/80 to-blue-100/80 border-blue-200/50',
      shadowColor: 'shadow-blue-100/50'
    },
    'bath': { 
      icon: Bath, 
      color: 'text-icon-blue', 
      bgColor: 'bg-gradient-to-br from-blue-50/80 to-blue-100/80 border-blue-200/50',
      shadowColor: 'shadow-blue-100/50'
    },
    'shower': { 
      icon: Bath, 
      color: 'text-icon-blue', 
      bgColor: 'bg-gradient-to-br from-blue-50/80 to-blue-100/80 border-blue-200/50',
      shadowColor: 'shadow-blue-100/50'
    },

    // Climate Control
    'air conditioning': { 
      icon: Wind, 
      color: 'text-icon-blue', 
      bgColor: 'bg-gradient-to-br from-sky-50/80 to-sky-100/80 border-sky-200/50',
      shadowColor: 'shadow-sky-100/50'
    },
    'ac': { 
      icon: Wind, 
      color: 'text-icon-blue', 
      bgColor: 'bg-gradient-to-br from-sky-50/80 to-sky-100/80 border-sky-200/50',
      shadowColor: 'shadow-sky-100/50'
    },
    'heating': { 
      icon: Flame, 
      color: 'text-icon-orange', 
      bgColor: 'bg-gradient-to-br from-orange-50/80 to-orange-100/80 border-orange-200/50',
      shadowColor: 'shadow-orange-100/50'
    },
    'fireplace': { 
      icon: Flame, 
      color: 'text-icon-orange', 
      bgColor: 'bg-gradient-to-br from-orange-50/80 to-orange-100/80 border-orange-200/50',
      shadowColor: 'shadow-orange-100/50'
    },

    // Entertainment & Gaming
    'gaming': { 
      icon: Gamepad2, 
      color: 'text-icon-purple', 
      bgColor: 'bg-gradient-to-br from-purple-50/80 to-purple-100/80 border-purple-200/50',
      shadowColor: 'shadow-purple-100/50'
    },
    'games': { 
      icon: Gamepad2, 
      color: 'text-icon-purple', 
      bgColor: 'bg-gradient-to-br from-purple-50/80 to-purple-100/80 border-purple-200/50',
      shadowColor: 'shadow-purple-100/50'
    },
    'xbox': { 
      icon: Gamepad2, 
      color: 'text-icon-purple', 
      bgColor: 'bg-gradient-to-br from-purple-50/80 to-purple-100/80 border-purple-200/50',
      shadowColor: 'shadow-purple-100/50'
    },
    'playstation': { 
      icon: Gamepad2, 
      color: 'text-icon-purple', 
      bgColor: 'bg-gradient-to-br from-purple-50/80 to-purple-100/80 border-purple-200/50',
      shadowColor: 'shadow-purple-100/50'
    },

    // Safety & Security
    'security': { 
      icon: Shield, 
      color: 'text-icon-rose', 
      bgColor: 'bg-gradient-to-br from-rose-50/80 to-rose-100/80 border-rose-200/50',
      shadowColor: 'shadow-rose-100/50'
    },
    'safe': { 
      icon: Shield, 
      color: 'text-icon-rose', 
      bgColor: 'bg-gradient-to-br from-rose-50/80 to-rose-100/80 border-rose-200/50',
      shadowColor: 'shadow-rose-100/50'
    },
    'keyless entry': { 
      icon: Shield, 
      color: 'text-icon-rose', 
      bgColor: 'bg-gradient-to-br from-rose-50/80 to-rose-100/80 border-rose-200/50',
      shadowColor: 'shadow-rose-100/50'
    },

    // Utilities & Services
    'electricity': { 
      icon: Zap, 
      color: 'text-icon-amber', 
      bgColor: 'bg-gradient-to-br from-amber-50/80 to-amber-100/80 border-amber-200/50',
      shadowColor: 'shadow-amber-100/50'
    },
    'power': { 
      icon: Zap, 
      color: 'text-icon-amber', 
      bgColor: 'bg-gradient-to-br from-amber-50/80 to-amber-100/80 border-amber-200/50',
      shadowColor: 'shadow-amber-100/50'
    },
    'backup power': { 
      icon: Zap, 
      color: 'text-icon-amber', 
      bgColor: 'bg-gradient-to-br from-amber-50/80 to-amber-100/80 border-amber-200/50',
      shadowColor: 'shadow-amber-100/50'
    },

    // Family & Accessibility
    'family friendly': { 
      icon: Users, 
      color: 'text-icon-green', 
      bgColor: 'bg-gradient-to-br from-green-50/80 to-green-100/80 border-green-200/50',
      shadowColor: 'shadow-green-100/50'
    },
    'kid friendly': { 
      icon: Users, 
      color: 'text-icon-green', 
      bgColor: 'bg-gradient-to-br from-green-50/80 to-green-100/80 border-green-200/50',
      shadowColor: 'shadow-green-100/50'
    },
    'children welcome': { 
      icon: Users, 
      color: 'text-icon-green', 
      bgColor: 'bg-gradient-to-br from-green-50/80 to-green-100/80 border-green-200/50',
      shadowColor: 'shadow-green-100/50'
    },

    // Policies & Services
    'free cancellation': { 
      icon: Shield, 
      color: 'text-icon-emerald', 
      bgColor: 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 border-emerald-200/50',
      shadowColor: 'shadow-emerald-100/50'
    },
    'flexible booking': { 
      icon: Shield, 
      color: 'text-icon-emerald', 
      bgColor: 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 border-emerald-200/50',
      shadowColor: 'shadow-emerald-100/50'
    },
  };

  // Smart fallback function with category detection
  const getAmenityConfig = (amenityName: string) => {
    const normalizedName = amenityName.toLowerCase().trim();
    
    // Direct match
    if (amenityConfig[normalizedName]) {
      return amenityConfig[normalizedName];
    }

    // Fuzzy matching for partial matches
    const fuzzyMatch = Object.keys(amenityConfig).find(key => 
      normalizedName.includes(key) || key.includes(normalizedName)
    );
    
    if (fuzzyMatch) {
      return amenityConfig[fuzzyMatch];
    }

    // Category-based fallbacks
    if (normalizedName.includes('kitchen') || normalizedName.includes('cooking') || normalizedName.includes('dining')) {
      return { 
        icon: Utensils, 
        color: 'text-icon-emerald', 
        bgColor: 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 border-emerald-200/50',
        shadowColor: 'shadow-emerald-100/50'
      };
    }
    
    if (normalizedName.includes('water') || normalizedName.includes('pool') || normalizedName.includes('bath')) {
      return { 
        icon: Waves, 
        color: 'text-icon-teal', 
        bgColor: 'bg-gradient-to-br from-teal-50/80 to-teal-100/80 border-teal-200/50',
        shadowColor: 'shadow-teal-100/50'
      };
    }
    
    if (normalizedName.includes('outdoor') || normalizedName.includes('garden') || normalizedName.includes('nature')) {
      return { 
        icon: TreePine, 
        color: 'text-icon-green', 
        bgColor: 'bg-gradient-to-br from-green-50/80 to-green-100/80 border-green-200/50',
        shadowColor: 'shadow-green-100/50'
      };
    }
    
    if (normalizedName.includes('game') || normalizedName.includes('entertainment') || normalizedName.includes('fun')) {
      return { 
        icon: Gamepad2, 
        color: 'text-icon-purple', 
        bgColor: 'bg-gradient-to-br from-purple-50/80 to-purple-100/80 border-purple-200/50',
        shadowColor: 'shadow-purple-100/50'
      };
    }
    
    if (normalizedName.includes('secure') || normalizedName.includes('safe') || normalizedName.includes('lock')) {
      return { 
        icon: Shield, 
        color: 'text-icon-rose', 
        bgColor: 'bg-gradient-to-br from-rose-50/80 to-rose-100/80 border-rose-200/50',
        shadowColor: 'shadow-rose-100/50'
      };
    }

    // Default fallback - use Home icon instead of Coffee
    return { 
      icon: Home, 
      color: 'text-icon-gray', 
      bgColor: 'bg-gradient-to-br from-gray-50/80 to-gray-100/80 border-gray-200/50',
      shadowColor: 'shadow-gray-100/50'
    };
  };

  const amenityList = amenities.split(',').map(item => item.trim()).filter(Boolean);
  
  // Show 12 amenities on desktop, 6 on mobile for perfect grid layouts
  const maxVisible = isMobile ? 6 : 12;
  const visibleAmenities = showAll ? amenityList : amenityList.slice(0, maxVisible);
  const hasMore = amenityList.length > maxVisible;

  if (amenityList.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Amenity details will be updated soon.</p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-4'}`}>
        {visibleAmenities.map((amenity, index) => {
          const config = getAmenityConfig(amenity);
          
          return (
            <AmenityCard
              key={index}
              amenity={amenity}
              icon={config.icon}
              config={config}
              isMobile={isMobile}
            />
          );
        })}
      </div>

      {hasMore && (
        <div className={`text-center ${isMobile ? 'mt-6' : 'mt-8 pt-6 border-t border-border/50'}`}>
          <Button 
            variant="outline" 
            size={isMobile ? 'default' : 'lg'}
            onClick={() => setShowAll(!showAll)}
            className={`text-primary border-primary hover:bg-primary hover:text-primary-foreground shadow-lg hover:shadow-xl transition-all ${!isMobile ? 'px-8' : ''}`}
          >
            <Plus className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
            {showAll ? 'Show Less' : `Show ${amenityList.length - maxVisible} More${!isMobile ? ' Amenities' : ''}`}
          </Button>
        </div>
      )}
    </>
  );
};

export default AmenityGrid;
