
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import AmenityHeader from './AmenityHeader';
import AmenityGrid from './AmenityGrid';

interface AmenitiesSectionProps {
  amenities?: string;
}

const AmenitiesSection = ({ amenities }: AmenitiesSectionProps) => {
  const isMobile = useIsMobile();

  if (!amenities) return null;

  if (isMobile) {
    // Mobile version - 2x3 grid using your design system
    return (
      <div className="py-8 bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to">
        <div className="px-4">
          <AmenityHeader isMobile={isMobile} />
          <AmenityGrid amenities={amenities} isMobile={isMobile} />
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
          <AmenityHeader isMobile={isMobile} />

          <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm relative overflow-hidden">
            {/* Subtle card decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gradient-accent-from/20 to-gradient-accent-to/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-gradient-accent-to/20 to-gradient-accent-from/20 rounded-full blur-2xl"></div>
            
            <CardContent className="p-8 relative">
              <AmenityGrid amenities={amenities} isMobile={isMobile} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AmenitiesSection;
