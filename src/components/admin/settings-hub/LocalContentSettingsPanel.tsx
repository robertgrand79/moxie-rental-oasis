import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Star, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const contentSections = [
  {
    id: 'events',
    title: 'Events',
    description: 'Manage local events, festivals, and activities for your guests',
    icon: Calendar,
    href: '/admin/events',
  },
  {
    id: 'places',
    title: 'Places & Points of Interest',
    description: 'Restaurants, attractions, activities, and local recommendations',
    icon: MapPin,
    href: '/admin/places',
  },
  {
    id: 'testimonials',
    title: 'Testimonials & Reviews',
    description: 'Guest reviews and testimonials to showcase on your site',
    icon: Star,
    href: '/admin/testimonials',
  },
];

const LocalContentSettingsPanel = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Local Content Management</CardTitle>
          <CardDescription>
            Manage location-specific content that helps guests discover your area.
            Each section has its own dedicated management page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contentSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.id} className="hover:bg-accent/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      {section.description}
                    </p>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link to={section.href} className="flex items-center gap-2">
                        Manage {section.title}
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalContentSettingsPanel;
