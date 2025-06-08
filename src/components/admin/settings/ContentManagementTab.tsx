
import React from 'react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardDescription, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Camera, MapPin, Calendar } from 'lucide-react';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import LifestyleGalleryManager from '@/components/admin/LifestyleGalleryManager';
import PointsOfInterestManager from '@/components/admin/PointsOfInterestManager';
import EugeneEventsManager from '@/components/admin/EugeneEventsManager';

const ContentManagementTab = () => {
  return (
    <EnhancedCard variant="glass">
      <EnhancedCardHeader>
        <EnhancedCardTitle>Content Management</EnhancedCardTitle>
        <EnhancedCardDescription>
          Manage testimonials, gallery images, points of interest, and events
        </EnhancedCardDescription>
      </EnhancedCardHeader>
      <EnhancedCardContent>
        <Tabs defaultValue="testimonials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="testimonials" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center space-x-2">
              <Camera className="h-4 w-4" />
              <span>Gallery</span>
            </TabsTrigger>
            <TabsTrigger value="poi" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>POI</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="testimonials">
            <TestimonialsManager />
          </TabsContent>

          <TabsContent value="gallery">
            <LifestyleGalleryManager />
          </TabsContent>

          <TabsContent value="poi">
            <PointsOfInterestManager />
          </TabsContent>

          <TabsContent value="events">
            <EugeneEventsManager />
          </TabsContent>
        </Tabs>
      </EnhancedCardContent>
    </EnhancedCard>
  );
};

export default ContentManagementTab;
