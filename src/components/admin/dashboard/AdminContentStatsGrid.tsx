import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Plus, Building2, BookOpen, MapPin, Camera, Star, Mail, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContentStat {
  title: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
  actionText: string;
  actionHref: string;
  additionalStats?: {
    label: string;
    value: number | string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

interface DashboardStats {
  properties: { total: number };
  blogPosts: { total: number; published: number };
  pointsOfInterest: { total: number; featured: number };
  galleryItems: { total: number; featured: number };
  testimonials: { total: number; featured: number };
  subscriberCount: number;
}

interface AdminContentStatsGridProps {
  stats: DashboardStats;
}

const AdminContentStatsGrid = ({ stats }: AdminContentStatsGridProps) => {
  const isMobile = useIsMobile();

  const contentStats: ContentStat[] = [
    {
      title: 'Properties',
      count: stats.properties.total,
      icon: Building2,
      color: 'text-blue-600',
      href: '/admin/properties',
      actionText: 'Add Property',
      actionHref: '/admin/properties?action=add'
    },
    {
      title: 'Blog Posts',
      count: stats.blogPosts.total,
      icon: BookOpen,
      color: 'text-green-600',
      href: '/admin/blog',
      actionText: 'Write Post',
      actionHref: '/admin/blog?action=add',
      additionalStats: [
        {
          label: 'Published',
          value: stats.blogPosts.published
        }
      ]
    },
    {
      title: 'Points of Interest',
      count: stats.pointsOfInterest.total,
      icon: MapPin,
      color: 'text-purple-600',
      href: '/admin/points-of-interest',
      actionText: 'Add POI',
      actionHref: '/admin/points-of-interest?action=add',
      additionalStats: [
        {
          label: 'Featured',
          value: stats.pointsOfInterest.featured
        }
      ]
    },
    {
      title: 'Lifestyle Gallery',
      count: stats.galleryItems.total,
      icon: Camera,
      color: 'text-orange-600',
      href: '/admin/lifestyle-gallery',
      actionText: 'Add Photo',
      actionHref: '/admin/lifestyle-gallery?action=add',
      additionalStats: [
        {
          label: 'Featured',
          value: stats.galleryItems.featured
        }
      ]
    },
    {
      title: 'Testimonials',
      count: stats.testimonials.total,
      icon: Star,
      color: 'text-amber-600',
      href: '/admin/testimonials',
      actionText: 'Add Review',
      actionHref: '/admin/testimonials?action=add',
      additionalStats: [
        {
          label: 'Featured',
          value: stats.testimonials.featured
        }
      ]
    },
    {
      title: 'Newsletter',
      count: stats.subscriberCount,
      icon: Mail,
      color: 'text-indigo-600',
      href: '/admin/newsletter',
      actionText: 'Send Newsletter',
      actionHref: '/admin/newsletter',
      additionalStats: [
        {
          label: 'Subscribers',
          value: stats.subscriberCount,
          icon: Users
        }
      ]
    }
  ];

  return (
    <div className={`grid gap-4 md:gap-6 ${
      isMobile 
        ? 'grid-cols-1' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    }`}>
      {contentStats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} ${stat.color}`} />
              <Badge variant="secondary" className={`${isMobile ? 'text-base px-2 py-1' : 'text-lg px-3 py-1'} font-semibold`}>
                {stat.count}
              </Badge>
            </div>
            
            <h3 className={`font-semibold text-gray-900 mb-3 ${isMobile ? 'text-base' : 'text-lg'}`}>
              {stat.title}
            </h3>
            
            {stat.additionalStats && (
              <div className="mb-4 space-y-2">
                {stat.additionalStats.map((addStat, index) => (
                  <div key={index} className={`flex items-center justify-between ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
                    <div className="flex items-center">
                      {addStat.icon && <addStat.icon className="h-3 w-3 mr-1" />}
                      <span>{addStat.label}:</span>
                    </div>
                    <span className="font-medium">{addStat.value}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-2">
              <Button asChild size={isMobile ? "sm" : "sm"} variant="outline" className={`w-full ${isMobile ? 'min-h-[44px]' : ''}`}>
                <Link to={stat.actionHref}>
                  <Plus className="h-3 w-3 mr-1" />
                  {stat.actionText}
                </Link>
              </Button>
              
              <Button asChild size={isMobile ? "sm" : "sm"} variant="ghost" className={`w-full ${isMobile ? 'min-h-[44px]' : ''}`}>
                <Link to={stat.href}>
                  Manage All
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminContentStatsGrid;
