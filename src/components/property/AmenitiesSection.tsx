
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, Car, Utensils, Tv, Waves, Coffee, Wind, Shield, Plus, Home, Snowflake, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AmenitiesSectionProps {
  amenities?: string;
}

const AmenitiesSection = ({ amenities }: AmenitiesSectionProps) => {
  const [showAll, setShowAll] = useState(false);
  const isMobile = useIsMobile();

  if (!amenities) return null;

  // Enhanced amenity configuration using your design system colors
  const amenityConfig: Record<string, { icon: any; color: string; bgColor: string; shadowColor: string }> = {
    'wifi': { 
      icon: Wifi, 
      color: 'text-icon-blue', 
      bgColor: 'bg-gradient-to-br from-blue-50/80 to-blue-100/80 border-blue-200/50',
      shadowColor: 'shadow-blue-100/50'
    },
    'parking': { 
      icon: Car, 
      color: 'text-icon-gray', 
      bgColor: 'bg-gradient-to-br from-gray-50/80 to-gray-100/80 border-gray-200/50',
      shadowColor: 'shadow-gray-100/50'
    },
    'kitchen': { 
      icon: Utensils, 
      color: 'text-icon-emerald', 
      bgColor: 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 border-emerald-200/50',
      shadowColor: 'shadow-emerald-100/50'
    },
    'tv': { 
      icon: Tv, 
      color: 'text-icon-purple', 
      bgColor: 'bg-gradient-to-br from-purple-50/80 to-purple-100/80 border-purple-200/50',
      shadowColor: 'shadow-purple-100/50'
    },
    'pool': { 
      icon: Waves, 
      color: 'text-icon-teal', 
      bgColor: 'bg-gradient-to-br from-teal-50/80 to-teal-100/80 border-teal-200/50',
      shadowColor: 'shadow-teal-100/50'
    },
    'coffee': { 
      icon: Coffee, 
      color: 'text-icon-amber', 
      bgColor: 'bg-gradient-to-br from-amber-50/80 to-amber-100/80 border-amber-200/50',
      shadowColor: 'shadow-amber-100/50'
    },
    'air conditioning': { 
      icon: Wind, 
      color: 'text-icon-blue', 
      bgColor: 'bg-gradient-to-br from-sky-50/80 to-sky-100/80 border-sky-200/50',
      shadowColor: 'shadow-sky-100/50'
    },
    'security': { 
      icon: Shield, 
      color: 'text-icon-rose', 
      bgColor: 'bg-gradient-to-br from-rose-50/80 to-rose-100/80 border-rose-200/50',
      shadowColor: 'shadow-rose-100/50'
    },
    'heating': { 
      icon: Home, 
      color: 'text-icon-orange', 
      bgColor: 'bg-gradient-to-br from-orange-50/80 to-orange-100/80 border-orange-200/50',
      shadowColor: 'shadow-orange-100/50'
    },
    'freezer': { 
      icon: Snowflake, 
      color: 'text-icon-indigo', 
      bgColor: 'bg-gradient-to-br from-indigo-50/80 to-indigo-100/80 border-indigo-200/50',
      shadowColor: 'shadow-indigo-100/50'
    },
    'family friendly': { 
      icon: Users, 
      color: 'text-icon-green', 
      bgColor: 'bg-gradient-to-br from-green-50/80 to-green-100/80 border-green-200/50',
      shadowColor: 'shadow-green-100/50'
    },
    'free cancellation': { 
      icon: Shield, 
      color: 'text-icon-emerald', 
      bgColor: 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 border-emerald-200/50',
      shadowColor: 'shadow-emerald-100/50'
    },
  };

  const amenityList = amenities.split(',').map(item => item.trim()).filter(Boolean);
  
  // Show 12 amenities on desktop, 6 on mobile for perfect grid layouts
  const maxVisible = isMobile ? 6 : 12;
  const visibleAmenities = showAll ? amenityList : amenityList.slice(0, maxVisible);
  const hasMore = amenityList.length > maxVisible;

  if (isMobile) {
    // Mobile version - 2x3 grid using your design system
    return (
      <div className="py-8 bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to">
        <div className="px-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Amenities & Features</h2>
            <p className="text-muted-foreground">Everything you need for a perfect stay</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {visibleAmenities.map((amenity, index) => {
              const config = amenityConfig[amenity.toLowerCase()] || { 
                icon: Coffee, 
                color: 'text-icon-amber', 
                bgColor: 'bg-gradient-to-br from-amber-50/80 to-amber-100/80 border-amber-200/50',
                shadowColor: 'shadow-amber-100/50'
              };
              const IconComponent = config.icon;
              
              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-xl border ${config.bgColor} ${config.shadowColor} shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl backdrop-blur-sm`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-background/90 flex items-center justify-center shadow-sm">
                      <IconComponent className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <span className="font-medium text-foreground text-sm capitalize leading-tight">{amenity}</span>
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
                className="text-primary border-primary hover:bg-primary hover:text-primary-foreground shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showAll ? 'Show Less' : `Show ${amenityList.length - maxVisible} More`}
              </Button>
            </div>
          )}
          
          {amenityList.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Amenity details will be updated soon.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop version - 3x4 grid (12 items) using your design system
  return (
    <div className="py-16 bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to relative overflow-hidden">
      {/* Subtle decorative elements using your gradient system */}
      <div className="absolute inset-0 bg-gradient-to-r from-gradient-accent-from/10 via-transparent to-gradient-accent-to/10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-gradient-accent-from/5 to-gradient-accent-to/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-gradient-accent-to/5 to-gradient-accent-from/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Amenities & Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need for a perfect stay</p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary/60 to-primary mx-auto mt-4 rounded-full"></div>
          </div>

          <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm relative overflow-hidden">
            {/* Subtle card decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gradient-accent-from/20 to-gradient-accent-to/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-gradient-accent-to/20 to-gradient-accent-from/20 rounded-full blur-2xl"></div>
            
            <CardContent className="p-8 relative">
              <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
                {visibleAmenities.map((amenity, index) => {
                  const config = amenityConfig[amenity.toLowerCase()] || { 
                    icon: Coffee, 
                    color: 'text-icon-amber', 
                    bgColor: 'bg-gradient-to-br from-amber-50/80 to-amber-100/80 border-amber-200/50',
                    shadowColor: 'shadow-amber-100/50'
                  };
                  const IconComponent = config.icon;
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-5 rounded-xl border ${config.bgColor} ${config.shadowColor} shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm`}
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center shadow-md">
                          <IconComponent className={`h-6 w-6 ${config.color}`} />
                        </div>
                        <span className="font-semibold text-foreground capitalize leading-tight">{amenity}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div className="text-center mt-8 pt-6 border-t border-border/50">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setShowAll(!showAll)}
                    className="text-primary border-primary hover:bg-primary hover:text-primary-foreground px-8 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {showAll ? 'Show Less' : `Show ${amenityList.length - maxVisible} More Amenities`}
                  </Button>
                </div>
              )}
              
              {amenityList.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Amenity details will be updated soon.</p>
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
