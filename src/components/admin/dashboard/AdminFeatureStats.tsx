
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MapPin, Camera, Star } from 'lucide-react';

interface FeatureStat {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

interface AdminFeatureStatsProps {
  pointsOfInterest: any[];
  galleryItems: any[];
  testimonials: any[];
}

const AdminFeatureStats = ({ pointsOfInterest, galleryItems, testimonials }: AdminFeatureStatsProps) => {
  const featureStats: FeatureStat[] = [
    {
      title: 'Points of Interest',
      value: pointsOfInterest.length,
      icon: MapPin,
      href: '/admin/poi'
    },
    {
      title: 'Lifestyle Gallery',
      value: galleryItems.length,
      icon: Camera,
      href: '/admin/lifestyle'
    },
    {
      title: 'Testimonials',
      value: testimonials.length,
      icon: Star,
      href: '/admin/testimonials'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {featureStats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <stat.icon className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium">{stat.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{stat.value}</Badge>
                <Button asChild size="sm" variant="ghost">
                  <Link to={stat.href}>Manage</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminFeatureStats;
