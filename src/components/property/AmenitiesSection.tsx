
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, Car, Utensils, Tv, Waves, Coffee, Wind, Shield, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AmenitiesSectionProps {
  amenities?: string;
}

const AmenitiesSection = ({ amenities }: AmenitiesSectionProps) => {
  const [showAll, setShowAll] = useState(false);
  const isMobile = useIsMobile();

  if (!amenities) return null;

  // Parse amenities and map to icons with colors
  const amenityConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
    'wifi': { icon: Wifi, color: 'text-icon-blue', bgColor: 'bg-blue-50 border-blue-200' },
    'parking': { icon: Car, color: 'text-icon-gray', bgColor: 'bg-gray-50 border-gray-200' },
    'kitchen': { icon: Utensils, color: 'text-icon-emerald', bgColor: 'bg-emerald-50 border-emerald-200' },
    'tv': { icon: Tv, color: 'text-icon-purple', bgColor: 'bg-purple-50 border-purple-200' },
    'pool': { icon: Waves, color: 'text-icon-teal', bgColor: 'bg-teal-50 border-teal-200' },
    'coffee': { icon: Coffee, color: 'text-icon-amber', bgColor: 'bg-amber-50 border-amber-200' },
    'air conditioning': { icon: Wind, color: 'text-icon-blue', bgColor: 'bg-blue-50 border-blue-200' },
    'security': { icon: Shield, color: 'text-icon-rose', bgColor: 'bg-rose-50 border-rose-200' },
  };

  const amenityList = amenities.split(',').map(item => item.trim()).filter(Boolean);
  
  // Show only top 6-8 amenities initially
  const maxVisible = isMobile ? 6 : 8;
  const visibleAmenities = showAll ? amenityList : amenityList.slice(0, maxVisible);
  const hasMore = amenityList.length > maxVisible;

  if (isMobile) {
    // Mobile version - compact colorful cards
    return (
      <div className="py-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="px-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Amenities & Features</h2>
            <p className="text-gray-600">Everything you need for a perfect stay</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {visibleAmenities.map((amenity, index) => {
              const config = amenityConfig[amenity.toLowerCase()] || { 
                icon: Coffee, 
                color: 'text-icon-orange', 
                bgColor: 'bg-orange-50 border-orange-200' 
              };
              const IconComponent = config.icon;
              
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-xl border-2 ${config.bgColor} transition-all duration-200 hover:scale-105`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
                      <IconComponent className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <span className="font-medium text-gray-900 text-sm capitalize leading-tight">{amenity}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {hasMore && (
            <div className="text-center mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowAll(!showAll)}
                className="text-primary border-primary hover:bg-primary hover:text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showAll ? 'Show Less' : `Show ${amenityList.length - maxVisible} More`}
              </Button>
            </div>
          )}
          
          {amenityList.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Amenity details will be updated soon.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop version - enhanced colorful grid
  return (
    <div className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Amenities & Features</h2>
            <p className="text-xl text-gray-600">Everything you need for a perfect stay</p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto mt-4"></div>
          </div>

          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {visibleAmenities.map((amenity, index) => {
                  const config = amenityConfig[amenity.toLowerCase()] || { 
                    icon: Coffee, 
                    color: 'text-icon-orange', 
                    bgColor: 'bg-orange-50 border-orange-200' 
                  };
                  const IconComponent = config.icon;
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-5 rounded-xl border-2 ${config.bgColor} transition-all duration-200 hover:scale-105 hover:shadow-md`}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                          <IconComponent className={`h-6 w-6 ${config.color}`} />
                        </div>
                        <span className="font-semibold text-gray-900 capitalize leading-tight">{amenity}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div className="text-center mt-8 pt-6 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setShowAll(!showAll)}
                    className="text-primary border-primary hover:bg-primary hover:text-white px-8"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {showAll ? 'Show Less' : `Show ${amenityList.length - maxVisible} More Amenities`}
                  </Button>
                </div>
              )}
              
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
