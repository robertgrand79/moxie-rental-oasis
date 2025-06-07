
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Image, Star, Eye, EyeOff } from 'lucide-react';
import { useCrossContentIntegration } from '@/hooks/useCrossContentIntegration';

const ContentStatsDashboard = () => {
  const { getContentStats } = useCrossContentIntegration();
  const stats = getContentStats();

  const statCards = [
    {
      title: 'Events',
      icon: <Calendar className="h-5 w-5" />,
      total: stats.totalEvents,
      active: stats.activeEvents,
      featured: stats.featuredEvents,
      color: 'blue'
    },
    {
      title: 'Points of Interest',
      icon: <MapPin className="h-5 w-5" />,
      total: stats.totalPOIs,
      active: stats.activePOIs,
      featured: stats.featuredPOIs,
      color: 'green'
    },
    {
      title: 'Lifestyle Gallery',
      icon: <Image className="h-5 w-5" />,
      total: stats.totalLifestyle,
      active: stats.activeLifestyle,
      featured: stats.featuredLifestyle,
      color: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`text-${stat.color}-600`}>
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.total}</div>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3 text-green-600" />
                <span className="text-xs text-gray-600">{stat.active} active</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-600" />
                <span className="text-xs text-gray-600">{stat.featured} featured</span>
              </div>
            </div>
            <div className="mt-2">
              <Badge 
                variant={stat.active === stat.total ? "default" : "secondary"}
                className="text-xs"
              >
                {Math.round((stat.active / Math.max(stat.total, 1)) * 100)}% active
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ContentStatsDashboard;
