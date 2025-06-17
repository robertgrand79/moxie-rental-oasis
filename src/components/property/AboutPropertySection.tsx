
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Property } from '@/types/property';
import { useIsMobile } from '@/hooks/use-mobile';
import PropertyDescription from './PropertyDescription';
import PropertyHighlights from './PropertyHighlights';
import PropertyLocationInfo from './PropertyLocationInfo';
import IntegratedBookingSection from './IntegratedBookingSection';

interface AboutPropertySectionProps {
  property: Property;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const AboutPropertySection = ({ property, activeTab = "about", onTabChange }: AboutPropertySectionProps) => {
  const isMobile = useIsMobile();

  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  if (isMobile) {
    return (
      <div className="py-6 bg-white" id="about-property">
        <div className="px-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-50 rounded-lg p-1">
              <TabsTrigger value="about" className="text-sm">About Property</TabsTrigger>
              <TabsTrigger value="booking" className="text-sm">Book This Property</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-6 mt-0">
              <PropertyLocationInfo property={property} isMobile={isMobile} />
              <PropertyDescription description={property.description} isMobile={isMobile} />
              <PropertyHighlights property={property} isMobile={isMobile} />
            </TabsContent>
            
            <TabsContent value="booking" className="mt-0">
              <IntegratedBookingSection property={property} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-white" id="about-property">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-50 rounded-none border-b border-gray-200 h-12">
                  <TabsTrigger value="about" className="text-base font-medium">About Property</TabsTrigger>
                  <TabsTrigger value="booking" className="text-base font-medium">Book This Property</TabsTrigger>
                </TabsList>
                
                <TabsContent value="about" className="mt-0">
                  <PropertyLocationInfo property={property} isMobile={isMobile} />
                  
                  <div className="p-8">
                    <PropertyDescription description={property.description} isMobile={isMobile} />
                    
                    <div className="mt-8 pt-8 border-t border-gray-100">
                      <PropertyHighlights property={property} isMobile={isMobile} />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="booking" className="mt-0">
                  <IntegratedBookingSection property={property} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AboutPropertySection;
