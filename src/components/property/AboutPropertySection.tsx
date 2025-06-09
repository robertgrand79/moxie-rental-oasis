
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Property } from '@/types/property';
import { useIsMobile } from '@/hooks/use-mobile';
import PropertyDescription from './PropertyDescription';
import PropertyHighlights from './PropertyHighlights';
import PropertyLocationInfo from './PropertyLocationInfo';

interface AboutPropertySectionProps {
  property: Property;
}

const AboutPropertySection = ({ property }: AboutPropertySectionProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="py-8 bg-white">
        <div className="px-4">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">About This Property</h2>
              <PropertyLocationInfo property={property} isMobile={isMobile} />
              <PropertyDescription description={property.description} isMobile={isMobile} />
            </div>
            
            <PropertyHighlights property={property} isMobile={isMobile} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About This Property</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto"></div>
          </div>
          
          <Card className="overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-0">
              <PropertyLocationInfo property={property} isMobile={isMobile} />
              
              <div className="p-8">
                <PropertyDescription description={property.description} isMobile={isMobile} />
                <PropertyHighlights property={property} isMobile={isMobile} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPropertySection;
