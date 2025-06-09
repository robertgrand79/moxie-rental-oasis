
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
      <div className="py-8 bg-gradient-to-br from-white to-gray-50">
        <div className="px-4">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">About This Property</h2>
              <p className="text-gray-600 text-sm mb-4">Discover what makes this place special</p>
              <PropertyLocationInfo property={property} isMobile={isMobile} />
            </div>
            
            <PropertyDescription description={property.description} isMobile={isMobile} />
            <PropertyHighlights property={property} isMobile={isMobile} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About This Property</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Discover the unique features and charm that make this property your perfect getaway
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full"></div>
          </div>
          
          <Card className="overflow-hidden shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-0">
              <PropertyLocationInfo property={property} isMobile={isMobile} />
              
              <div className="p-8">
                <PropertyDescription description={property.description} isMobile={isMobile} />
                
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <PropertyHighlights property={property} isMobile={isMobile} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPropertySection;
