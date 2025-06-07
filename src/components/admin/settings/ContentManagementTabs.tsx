
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import LifestyleGalleryManager from '@/components/admin/LifestyleGalleryManager';
import PointsOfInterestManager from '@/components/admin/PointsOfInterestManager';

const GalleryTab = () => <LifestyleGalleryManager />;

const PointsOfInterestTab = () => <PointsOfInterestManager />;

const EventsTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Eugene Events</CardTitle>
      <CardDescription>
        Manage local events and activities to showcase to guests
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8 text-gray-500">
        Events management component coming soon...
      </div>
    </CardContent>
  </Card>
);

export { TestimonialsManager, GalleryTab, PointsOfInterestTab, EventsTab };
