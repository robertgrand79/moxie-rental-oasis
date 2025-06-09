import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wifi, Car, Utensils, Tv, Waves, Coffee, Wind, Shield } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AmenitiesSectionProps {
  amenities?: string;
}

const AmenitiesSection = ({ amenities }: AmenitiesSectionProps) => {
  const isMobile = useIsMobile();

  if (!amenities) return null;

  // Parse amenities and map to icons
  const amenityIcons: Record<string, any> = {
    'wifi': Wifi,
    'parking': Car,
    'kitchen': Utensils,
    'tv': Tv,
    'pool': Waves,
    'coffee': Coffee,
    'air conditioning': Wind,
    'security': Shield,
  };

  const amenityList = amenities.split(',').map(item => item.trim()).filter(Boolean);

  if (isMobile) {
    // Mobile version - simpler layout
    return (
      <div className="py-8 bg-gray-50">
        <div className="px-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Amenities & Features</h2>
            <p className="text-gray-600">Everything you need for a comfortable stay</p>
          </div>

          <div className="space-y-3">
            {amenityList.map((amenity, index) => {
              const IconComponent = amenityIcons[amenity.toLowerCase()] || Coffee;
              return (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium text-gray-900 capitalize">{amenity}</span>
                </div>
              );
            })}
          </div>
          
          {amenityList.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Amenity details will be updated soon.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop version - keep existing design
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Amenities & Features</h2>
            <p className="text-xl text-gray-600">Everything you need for a comfortable stay</p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto mt-4"></div>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {amenityList.map((amenity, index) => {
                  const IconComponent = amenityIcons[amenity.toLowerCase()] || Coffee;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-4 rounded-lg bg-gray-50 hover:bg-primary/5 transition-colors">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium text-gray-900 capitalize">{amenity}</span>
                    </div>
                  );
                })}
              </div>
              
              {amenityList.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">Amenity details will be updated soon.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AmenitiesSection;
