
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TestimonialsManager from '@/components/admin/TestimonialsManager';

const GalleryTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Lifestyle Gallery</CardTitle>
      <CardDescription>
        Manage photos showcasing Eugene's lifestyle and activities
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="text-center py-8 text-gray-500">
        Gallery management component coming soon...
      </div>
    </CardContent>
  </Card>
);

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

export { TestimonialsManager, GalleryTab, EventsTab };
