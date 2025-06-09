
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

  // Parse amenities and map to icons with enhanced vibrant colors
  const amenityConfig: Record<string, { icon: any; color: string; bgColor: string; shadowColor: string }> = {
    'wifi': { 
      icon: Wifi, 
      color: 'text-icon-blue', 
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300',
      shadowColor: 'shadow-blue-100'
    },
    'parking': { 
      icon: Car, 
      color: 'text-icon-gray', 
      bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300',
      shadowColor: 'shadow-gray-100'
    },
    'kitchen': { 
      icon: Utensils, 
      color: 'text-icon-emerald', 
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300',
      shadowColor: 'shadow-emerald-100'
    },
    'tv': { 
      icon: Tv, 
      color: 'text-icon-purple', 
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300',
      shadowColor: 'shadow-purple-100'
    },
    'pool': { 
      icon: Waves, 
      color: 'text-icon-teal', 
      bgColor: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-300',
      shadowColor: 'shadow-teal-100'
    },
    'coffee': { 
      icon: Coffee, 
      color: 'text-icon-amber', 
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300',
      shadowColor: 'shadow-amber-100'
    },
    'air conditioning': { 
      icon: Wind, 
      color: 'text-icon-blue', 
      bgColor: 'bg-gradient-to-br from-sky-50 to-sky-100 border-sky-300',
      shadowColor: 'shadow-sky-100'
    },
    'security': { 
      icon: Shield, 
      color: 'text-icon-rose', 
      bgColor: 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-300',
      shadowColor: 'shadow-rose-100'
    },
  };

  const amenityList = amenities.split(',').map(item => item.trim()).filter(Boolean);
  
  // Show only top 6-8 amenities initially
  const maxVisible = isMobile ? 6 : 8;
  const visibleAmenities = showAll ? amenityList : amenityList.slice(0, maxVisible);
  const hasMore = amenityList.length > maxVisible;

  if (isMobile) {
    // Mobile version - enhanced vibrant cards
    return (
      <div className="py-8 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
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
                bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300',
                shadowColor: 'shadow-orange-100'
              };
              const IconComponent = config.icon;
              
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-xl border-2 ${config.bgColor} ${config.shadowColor} shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
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
                className="text-primary border-primary hover:bg-primary hover:text-white shadow-lg"
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

  // Desktop version - enhanced vibrant design with warm gradients
  return (
    <div className="py-16 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-100/20 via-transparent to-amber-100/20"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-200/10 to-orange-200/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-200/10 to-orange-200/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Amenities & Features</h2>
            <p className="text-xl text-gray-600">Everything you need for a perfect stay</p>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-amber-400 mx-auto mt-4 rounded-full"></div>
          </div>

          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative overflow-hidden">
            {/* Card decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/30 to-amber-100/30 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-yellow-100/30 to-orange-100/30 rounded-full blur-2xl"></div>
            
            <CardContent className="p-8 relative">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {visibleAmenities.map((amenity, index) => {
                  const config = amenityConfig[amenity.toLowerCase()] || { 
                    icon: Coffee, 
                    color: 'text-icon-orange', 
                    bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300',
                    shadowColor: 'shadow-orange-100'
                  };
                  const IconComponent = config.icon;
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-5 rounded-xl border-2 ${config.bgColor} ${config.shadowColor} shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl hover:-translate-y-1`}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-md">
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
                    className="text-primary border-primary hover:bg-primary hover:text-white px-8 shadow-lg hover:shadow-xl transition-all"
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
