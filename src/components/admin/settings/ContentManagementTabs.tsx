
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import LifestyleGalleryManager from '@/components/admin/LifestyleGalleryManager';
import PointsOfInterestManager from '@/components/admin/PointsOfInterestManager';
import EugeneEventsManager from '@/components/admin/EugeneEventsManager';

const GalleryTab = () => <LifestyleGalleryManager />;

const PointsOfInterestTab = () => <PointsOfInterestManager />;

const EventsTab = () => <EugeneEventsManager />;

export { TestimonialsManager, GalleryTab, PointsOfInterestTab, EventsTab };
